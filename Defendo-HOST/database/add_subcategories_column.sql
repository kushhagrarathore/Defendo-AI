-- Add subcategories column to host_services table
-- Run this in Supabase SQL Editor

-- 1) Add subcategories column to store JSON data
ALTER TABLE public.host_services 
ADD COLUMN IF NOT EXISTS subcategories JSONB DEFAULT '{}';

-- 2) Add index for better performance on subcategories queries
CREATE INDEX IF NOT EXISTS idx_host_services_subcategories ON public.host_services USING GIN (subcategories);

-- 3) Add comment to explain the column structure
COMMENT ON COLUMN public.host_services.subcategories IS 
'JSON object storing subcategories and their pricing. Structure: {"subcategory_key": {"label": "Display Name", "price_per_hour": 100.0, "currency": "INR"}}';

-- 4) Example of subcategories data structure:
-- {
--   "security_guard": {
--     "label": "Security Guard",
--     "price_per_hour": 150.0,
--     "currency": "INR"
--   },
--   "security_supervisor": {
--     "label": "Security Supervisor", 
--     "price_per_hour": 250.0,
--     "currency": "INR"
--   },
--   "other": {
--     "label": "Night Patrol Guard",
--     "price_per_hour": 180.0,
--     "currency": "INR"
--   }
-- }

-- 5) Verify the column was added
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'host_services' AND column_name = 'subcategories';

SELECT 'subcategories column added successfully' AS status;













