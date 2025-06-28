-- Drop existing table and recreate to ensure clean setup
DROP TABLE IF EXISTS games CASCADE;

-- Create the games table
CREATE TABLE games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('finished', 'unfinished', 'wishlist')),
  personal_note TEXT,
  added_on TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  year INTEGER,
  genre TEXT,
  developer TEXT,
  cover_url TEXT,
  x REAL NOT NULL,
  y REAL NOT NULL,
  width REAL NOT NULL DEFAULT 280,
  height REAL NOT NULL DEFAULT 200,
  z_index INTEGER NOT NULL,
  window_type TEXT NOT NULL CHECK (window_type IN ('terminal', 'file', 'glitch', 'memory')),
  memory_clarity TEXT NOT NULL DEFAULT 'vivid' CHECK (memory_clarity IN ('vivid', 'faded', 'forgotten')),
  is_visible BOOLEAN DEFAULT true,
  metacritic INTEGER,
  platforms TEXT[], -- Array of platform names
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_games_added_on ON games(added_on DESC);
CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_games_title ON games USING gin(to_tsvector('english', title));

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_games_updated_at
    BEFORE UPDATE ON games
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE games ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for now
CREATE POLICY "Allow all operations on games" ON games
    FOR ALL USING (true);

-- Insert some sample data to test the connection
INSERT INTO games (title, status, personal_note, year, genre, developer, cover_url, x, y, z_index, window_type) VALUES
('Test Game', 'finished', 'This is a test game to verify the database connection works.', 2024, 'Test', 'Test Developer', '/placeholder.svg?height=300&width=200', 100, 100, 1, 'terminal');
