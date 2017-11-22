BEGIN;

-- CREATE TABLE extensions (
--     id SERIAL PRIMARY KEY,
--     created_at TIMESTAMP NOT NULL,
--     updated_at TIMESTAMP NOT NULL,
--     twitch_ext_id TEXT NOT NULL,
--     state TEXT NOT NULL,
--     version TEXT NOT NULL,
--     anchor TEXT NOT NULL,
--     panel_height INTEGER NOT NULL,
--     author_name TEXT NOT NULL,
--     support_email TEXT NOT NULL,
--     name TEXT NOT NULL,
--     description TEXT,
--     summary TEXT,
--     viewer_url TEXT NOT NULL,
--     config_url TEXT NOT NULL,
--     live_config_url TEXT,
--     icon_url TEXT NOT NULL,
--     screenshot_urls TEXT[],
--     asset_urls TEXT[],
--     installation_count INTEGER NOT NULL,
--     can_install BOOLEAN NOT NULL,
--     whitelisted_panel_urls TEXT[],
--     whitelisted_config_urls TEXT[],
--     required_broadcaster_abilities TEXT[],
--     eula_tos_url TEXT,
--     privacy_policy_url TEXT,
--     request_identity_link BOOLEAN NOT NULL,
--     vendor_code TEXT,
--     sku TEXT
-- );

CREATE TABLE channels (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  twitch_id TEXT NOT NULL,
  username TEXT NOT NULL,
  game TEXT NOT NULL,
  title TEXT NOT NULL,
  view_count TEXT NOT NULL
);

COMMIT;