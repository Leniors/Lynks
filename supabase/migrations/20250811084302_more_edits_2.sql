ALTER TABLE profiles
ADD COLUMN theme jsonb DEFAULT '{
  "backgroundColor": "#ffffff",
  "cardBackground": "#f8f9fa",
  "primaryColor": "#000000",
  "textColor": "#374151",
  "buttonStyle": "default",
  "fontFamily": "Inter",
  "borderRadius": "8px"
}';
