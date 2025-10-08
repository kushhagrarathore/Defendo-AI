-- Helper functions for working with host_service_subcategories table

-- Function to get all subcategories for a specific service
CREATE OR REPLACE FUNCTION get_service_subcategories(service_uuid UUID)
RETURNS TABLE (
    id UUID,
    subcategory_key VARCHAR,
    subcategory_label VARCHAR,
    subcategory_type VARCHAR,
    price_per_hour DECIMAL,
    currency VARCHAR,
    description TEXT,
    display_order INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sub.id,
        sub.subcategory_key,
        sub.subcategory_label,
        sub.subcategory_type,
        sub.price_per_hour,
        sub.currency,
        sub.description,
        sub.display_order
    FROM public.host_service_subcategories sub
    WHERE sub.service_id = service_uuid 
    AND sub.is_active = true
    ORDER BY sub.display_order, sub.subcategory_label;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get subcategories for a host
CREATE OR REPLACE FUNCTION get_host_subcategories(host_uuid UUID)
RETURNS TABLE (
    service_id UUID,
    service_name VARCHAR,
    service_type VARCHAR,
    subcategory_id UUID,
    subcategory_key VARCHAR,
    subcategory_label VARCHAR,
    price_per_hour DECIMAL,
    currency VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        hs.id as service_id,
        hs.name as service_name,
        hs.service_type,
        sub.id as subcategory_id,
        sub.subcategory_key,
        sub.subcategory_label,
        sub.price_per_hour,
        sub.currency
    FROM public.host_services hs
    JOIN public.host_service_subcategories sub ON hs.id = sub.service_id
    WHERE hs.host_id = host_uuid 
    AND hs.is_active = true 
    AND sub.is_active = true
    ORDER BY hs.name, sub.display_order, sub.subcategory_label;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add/update subcategories for a service
CREATE OR REPLACE FUNCTION upsert_service_subcategories(
    p_service_id UUID,
    p_host_id UUID,
    p_subcategories JSONB
) RETURNS INTEGER AS $$
DECLARE
    subcategory_record RECORD;
    inserted_count INTEGER := 0;
BEGIN
    -- First, deactivate all existing subcategories for this service
    UPDATE public.host_service_subcategories 
    SET is_active = false, updated_at = NOW()
    WHERE service_id = p_service_id;
    
    -- Insert/update subcategories from JSONB input
    FOR subcategory_record IN 
        SELECT 
            key as subcategory_key,
            value->>'label' as subcategory_label,
            (value->>'price_per_hour')::decimal as price_per_hour,
            COALESCE(value->>'currency', 'INR') as currency,
            value->>'description' as description
        FROM jsonb_each(p_subcategories) 
        WHERE value->>'price_per_hour' IS NOT NULL
    LOOP
        -- Insert or update subcategory
        INSERT INTO public.host_service_subcategories (
            service_id,
            host_id,
            subcategory_key,
            subcategory_label,
            subcategory_type,
            price_per_hour,
            currency,
            description,
            is_active,
            display_order
        ) VALUES (
            p_service_id,
            p_host_id,
            subcategory_record.subcategory_key,
            subcategory_record.subcategory_label,
            CASE 
                WHEN subcategory_record.subcategory_key = 'other' THEN 'custom'
                ELSE 'predefined'
            END,
            subcategory_record.price_per_hour,
            subcategory_record.currency,
            subcategory_record.description,
            true,
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
        ON CONFLICT (service_id, subcategory_key) 
        DO UPDATE SET
            subcategory_label = EXCLUDED.subcategory_label,
            price_per_hour = EXCLUDED.price_per_hour,
            currency = EXCLUDED.currency,
            description = EXCLUDED.description,
            is_active = true,
            updated_at = NOW();
        
        inserted_count := inserted_count + 1;
    END LOOP;
    
    RETURN inserted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get pricing summary for a service
CREATE OR REPLACE FUNCTION get_service_pricing_summary(service_uuid UUID)
RETURNS TABLE (
    min_price DECIMAL,
    max_price DECIMAL,
    avg_price DECIMAL,
    currency VARCHAR,
    subcategory_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        MIN(sub.price_per_hour) as min_price,
        MAX(sub.price_per_hour) as max_price,
        ROUND(AVG(sub.price_per_hour), 2) as avg_price,
        sub.currency,
        COUNT(*)::INTEGER as subcategory_count
    FROM public.host_service_subcategories sub
    WHERE sub.service_id = service_uuid 
    AND sub.is_active = true
    GROUP BY sub.currency;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to search services by price range
CREATE OR REPLACE FUNCTION search_services_by_price(
    p_min_price DECIMAL DEFAULT 0,
    p_max_price DECIMAL DEFAULT 999999,
    p_service_type VARCHAR DEFAULT NULL,
    p_city VARCHAR DEFAULT NULL,
    p_state VARCHAR DEFAULT NULL
) RETURNS TABLE (
    service_id UUID,
    service_name VARCHAR,
    service_type VARCHAR,
    host_name VARCHAR,
    company_name VARCHAR,
    city VARCHAR,
    state VARCHAR,
    min_price DECIMAL,
    max_price DECIMAL,
    subcategory_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT
        hs.id as service_id,
        hs.name as service_name,
        hs.service_type,
        hp.full_name as host_name,
        hp.company_name,
        hp.city,
        hp.state,
        MIN(sub.price_per_hour) as min_price,
        MAX(sub.price_per_hour) as max_price,
        COUNT(sub.id) as subcategory_count
    FROM public.host_services hs
    JOIN public.host_service_subcategories sub ON hs.id = sub.service_id
    LEFT JOIN public.host_profiles hp ON hs.host_id = hp.id
    WHERE hs.is_active = true 
    AND sub.is_active = true
    AND sub.price_per_hour BETWEEN p_min_price AND p_max_price
    AND (p_service_type IS NULL OR hs.service_type = p_service_type)
    AND (p_city IS NULL OR hp.city ILIKE '%' || p_city || '%')
    AND (p_state IS NULL OR hp.state ILIKE '%' || p_state || '%')
    GROUP BY hs.id, hs.name, hs.service_type, hp.full_name, hp.company_name, hp.city, hp.state
    ORDER BY min_price;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get popular subcategories
CREATE OR REPLACE FUNCTION get_popular_subcategories(
    p_service_type VARCHAR DEFAULT NULL,
    p_limit INTEGER DEFAULT 10
) RETURNS TABLE (
    subcategory_key VARCHAR,
    subcategory_label VARCHAR,
    service_count BIGINT,
    avg_price DECIMAL,
    min_price DECIMAL,
    max_price DECIMAL,
    currency VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sub.subcategory_key,
        sub.subcategory_label,
        COUNT(DISTINCT sub.service_id) as service_count,
        ROUND(AVG(sub.price_per_hour), 2) as avg_price,
        MIN(sub.price_per_hour) as min_price,
        MAX(sub.price_per_hour) as max_price,
        sub.currency
    FROM public.host_service_subcategories sub
    JOIN public.host_services hs ON sub.service_id = hs.id
    WHERE sub.is_active = true 
    AND hs.is_active = true
    AND (p_service_type IS NULL OR hs.service_type = p_service_type)
    GROUP BY sub.subcategory_key, sub.subcategory_label, sub.currency
    HAVING COUNT(DISTINCT sub.service_id) > 0
    ORDER BY service_count DESC, avg_price
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_service_subcategories(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_host_subcategories(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION upsert_service_subcategories(UUID, UUID, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION get_service_pricing_summary(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION search_services_by_price(DECIMAL, DECIMAL, VARCHAR, VARCHAR, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION get_popular_subcategories(VARCHAR, INTEGER) TO authenticated;

-- Grant execute permissions to anonymous users for public functions
GRANT EXECUTE ON FUNCTION get_service_subcategories(UUID) TO anon;
GRANT EXECUTE ON FUNCTION get_service_pricing_summary(UUID) TO anon;
GRANT EXECUTE ON FUNCTION search_services_by_price(DECIMAL, DECIMAL, VARCHAR, VARCHAR, VARCHAR) TO anon;
GRANT EXECUTE ON FUNCTION get_popular_subcategories(VARCHAR, INTEGER) TO anon;













