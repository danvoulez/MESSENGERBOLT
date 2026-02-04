/*
  # Sistema de Círculos (Multi-tenant)

  1. Novas Tabelas
    - `circles` - Círculos/tenants do sistema
    - `circle_memberships` - Membros dos círculos
    - `circle_invitations` - Convites pendentes

  2. Modificações
    - Adicionar `circle_id` nas tabelas existentes
    - Atualizar políticas RLS para multi-tenant

  3. Segurança
    - RLS baseado em circle_id
    - Políticas para membros do círculo
*/

-- Circles table
CREATE TABLE IF NOT EXISTS circles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  code text UNIQUE NOT NULL,
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  is_public boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE circles ENABLE ROW LEVEL SECURITY;

-- Circle memberships table
CREATE TABLE IF NOT EXISTS circle_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id uuid REFERENCES circles(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role text DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at timestamptz DEFAULT now(),
  UNIQUE(circle_id, user_id)
);

ALTER TABLE circle_memberships ENABLE ROW LEVEL SECURITY;

-- Circle invitations table
CREATE TABLE IF NOT EXISTS circle_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id uuid REFERENCES circles(id) ON DELETE CASCADE NOT NULL,
  email text NOT NULL,
  invited_by uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  expires_at timestamptz DEFAULT (now() + interval '7 days'),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE circle_invitations ENABLE ROW LEVEL SECURITY;

-- Add circle_id to existing tables
DO $$
BEGIN
  -- Add circle_id to contracts
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contracts' AND column_name = 'circle_id'
  ) THEN
    ALTER TABLE contracts ADD COLUMN circle_id uuid REFERENCES circles(id) ON DELETE CASCADE;
  END IF;

  -- Add circle_id to messages
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'circle_id'
  ) THEN
    ALTER TABLE messages ADD COLUMN circle_id uuid REFERENCES circles(id) ON DELETE CASCADE;
  END IF;

  -- Add circle_id to tasks
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'circle_id'
  ) THEN
    ALTER TABLE tasks ADD COLUMN circle_id uuid REFERENCES circles(id) ON DELETE CASCADE;
  END IF;

  -- Add circle_id to whatsapp_chats
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'whatsapp_chats' AND column_name = 'circle_id'
  ) THEN
    ALTER TABLE whatsapp_chats ADD COLUMN circle_id uuid REFERENCES circles(id) ON DELETE CASCADE;
  END IF;

  -- Add circle_id to whatsapp_messages
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'whatsapp_messages' AND column_name = 'circle_id'
  ) THEN
    ALTER TABLE whatsapp_messages ADD COLUMN circle_id uuid REFERENCES circles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- RLS Policies for circles
CREATE POLICY "Users can read circles they are members of"
  ON circles
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT circle_id FROM circle_memberships 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create circles"
  ON circles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Circle owners can update their circles"
  ON circles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- RLS Policies for circle_memberships
CREATE POLICY "Users can read memberships of their circles"
  ON circle_memberships
  FOR SELECT
  TO authenticated
  USING (
    circle_id IN (
      SELECT circle_id FROM circle_memberships 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join circles"
  ON circle_memberships
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for circle_invitations
CREATE POLICY "Users can read invitations for their circles"
  ON circle_invitations
  FOR SELECT
  TO authenticated
  USING (
    circle_id IN (
      SELECT circle_id FROM circle_memberships 
      WHERE user_id = auth.uid()
    )
  );

-- Function to generate unique circle code
CREATE OR REPLACE FUNCTION generate_circle_code()
RETURNS text AS $$
DECLARE
  code text;
  exists boolean;
BEGIN
  LOOP
    code := upper(substring(md5(random()::text) from 1 for 6));
    SELECT EXISTS(SELECT 1 FROM circles WHERE circles.code = code) INTO exists;
    IF NOT exists THEN
      EXIT;
    END IF;
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Function to create circle with membership
CREATE OR REPLACE FUNCTION create_circle_with_membership(
  circle_name text,
  circle_description text DEFAULT '',
  is_public boolean DEFAULT true
)
RETURNS uuid AS $$
DECLARE
  new_circle_id uuid;
  circle_code text;
BEGIN
  -- Generate unique code
  circle_code := generate_circle_code();
  
  -- Create circle
  INSERT INTO circles (name, description, code, owner_id, is_public)
  VALUES (circle_name, circle_description, circle_code, auth.uid(), is_public)
  RETURNING id INTO new_circle_id;
  
  -- Add owner as member
  INSERT INTO circle_memberships (circle_id, user_id, role)
  VALUES (new_circle_id, auth.uid(), 'owner');
  
  RETURN new_circle_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to join circle by code
CREATE OR REPLACE FUNCTION join_circle_by_code(circle_code text)
RETURNS boolean AS $$
DECLARE
  target_circle_id uuid;
BEGIN
  -- Find circle by code
  SELECT id INTO target_circle_id
  FROM circles
  WHERE code = circle_code;
  
  IF target_circle_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Add user as member (if not already)
  INSERT INTO circle_memberships (circle_id, user_id, role)
  VALUES (target_circle_id, auth.uid(), 'member')
  ON CONFLICT (circle_id, user_id) DO NOTHING;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add updated_at triggers
CREATE TRIGGER update_circles_updated_at
  BEFORE UPDATE ON circles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- View for user's circles with member count
CREATE OR REPLACE VIEW user_circles AS
SELECT 
  c.*,
  cm.role as user_role,
  (SELECT COUNT(*) FROM circle_memberships WHERE circle_id = c.id) as member_count
FROM circles c
JOIN circle_memberships cm ON c.id = cm.circle_id
WHERE cm.user_id = auth.uid();

-- Grant permissions
GRANT SELECT ON user_circles TO authenticated;