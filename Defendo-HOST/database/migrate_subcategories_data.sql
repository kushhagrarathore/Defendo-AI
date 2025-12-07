-- Migration script to move existing subcategory data from JSONB column to new table
-- Run this AFTER creating the host_service_subcategories table

-- Function to migrate existing subcategory data
CREATE OR REPLACE FUNCTION migrate_subcategories_from_jsonb()
RETURNS INTEGER AS $$
DECLARE
    service_record RECORD;
    subcategory_record RECORD;
    inserted_count INTEGER := 0;
BEGIN
    -- Loop through all host services that have subcategories data
    FOR service_record IN 
        SELECT id, host_id, subcategories 
        FROM public.host_services 
        WHERE subcategories IS NOT NULL 
        AND subcategories != '{}'::jsonb
    LOOP
        -- Extract each subcategory from the JSONB and insert into new table
        FOR subcategory_record IN 
            SELECT 
                key as subcategory_key,
                value->>'label' as subcategory_label,
                (value->>'price_per_hour')::decimal as price_per_hour,
                COALESCE(value->>'currency', 'INR') as currency
            FROM jsonb_each(service_record.subcategories) 
            WHERE value->>'price_per_hour' IS NOT NULL
        LOOP
            -- Insert into new table
            INSERT INTO public.host_service_subcategories (
                service_id,
                host_id,
                subcategory_key,
                subcategory_label,
                subcategory_type,
                price_per_hour,
                currency,
                display_order
            ) VALUES (
                service_record.id,
                service_record.host_id,
                subcategory_record.subcategory_key,
                subcategory_record.subcategory_label,
                CASE 
                    WHEN subcategory_record.subcategory_key = 'other' THEN 'custom'
                    ELSE 'predefined'
                END,
                subcategory_record.price_per_hour,
                subcategory_record.currency,
                CASE subcategory_record.subcategory_key
                    WHEN 'security_guard' THEN 1
                    WHEN 'security_supervisor' THEN 2
                    WHEN 'male_bouncer' THEN 3
                    WHEN 'female_bouncer' THEN 4
                    WHEN 'surveillance_drone' THEN 1
                    WHEN 'patrol_drone' THEN 2
                    WHEN 'event_monitoring' THEN 3
                    WHEN 'security_agency' THEN 1
                    WHEN 'investigation_agency' THEN 2
                    WHEN 'consulting_agency' THEN 3
                    ELSE 99
                END
            )
            ON CONFLICT (service_id, subcategory_key) DO NOTHING;
            
            inserted_count := inserted_count + 1;
        END LOOP;
    END LOOP;
    
    RETURN inserted_count;
END;
$$ LANGUAGE plpgsql;

-- Execute the migration
SELECT migrate_subcategories_from_jsonb() as migrated_records;

-- Clean up the migration function
DROP FUNCTION migrate_subcategories_from_jsonb();

-- Optional: Remove the old subcategories column from host_services
-- Uncomment the following line if you want to remove the JSONB column
-- ALTER TABLE public.host_services DROP COLUMN IF EXISTS subcategories;

-- Verify migration results
SELECT 
    COUNT(*) as total_subcategories,
    COUNT(DISTINCT service_id) as services_with_subcategories,
    COUNT(DISTINCT host_id) as hosts_with_subcategories
FROM public.host_service_subcategories;

-- Show sample migrated data
SELECT 
    hs.name as service_name,
    hs.service_type,
    sub.subcategory_label,
    sub.price_per_hour,
    sub.currency
FROM public.host_service_subcategories sub
JOIN public.host_services hs ON sub.service_id = hs.id
ORDER BY hs.name, sub.display_order
LIMIT 10;



























