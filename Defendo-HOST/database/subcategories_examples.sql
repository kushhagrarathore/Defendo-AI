-- Example queries and usage for host_service_subcategories table

-- =====================================================
-- BASIC QUERIES
-- =====================================================

-- 1. Get all subcategories for a specific service
SELECT 
    subcategory_key,
    subcategory_label,
    price_per_hour,
    currency,
    subcategory_type
FROM public.host_service_subcategories 
WHERE service_id = 'your-service-uuid-here' 
AND is_active = true
ORDER BY display_order;

-- 2. Get all services with their subcategories
SELECT 
    hs.name as service_name,
    hs.service_type,
    sub.subcategory_label,
    sub.price_per_hour,
    sub.currency
FROM public.host_services hs
JOIN public.host_service_subcategories sub ON hs.id = sub.service_id
WHERE hs.is_active = true AND sub.is_active = true
ORDER BY hs.name, sub.display_order;

-- 3. Get pricing range for each service
SELECT 
    hs.name as service_name,
    COUNT(sub.id) as subcategory_count,
    MIN(sub.price_per_hour) as min_price,
    MAX(sub.price_per_hour) as max_price,
    ROUND(AVG(sub.price_per_hour), 2) as avg_price,
    sub.currency
FROM public.host_services hs
JOIN public.host_service_subcategories sub ON hs.id = sub.service_id
WHERE hs.is_active = true AND sub.is_active = true
GROUP BY hs.id, hs.name, sub.currency
ORDER BY min_price;

-- =====================================================
-- ADVANCED QUERIES
-- =====================================================

-- 4. Find services within a price range
SELECT DISTINCT
    hs.id,
    hs.name,
    hs.service_type,
    hp.company_name,
    hp.city,
    hp.state,
    MIN(sub.price_per_hour) as starting_price,
    MAX(sub.price_per_hour) as max_price
FROM public.host_services hs
JOIN public.host_service_subcategories sub ON hs.id = sub.service_id
LEFT JOIN public.host_profiles hp ON hs.host_id = hp.id
WHERE hs.is_active = true 
AND sub.is_active = true
AND sub.price_per_hour BETWEEN 300 AND 1000  -- Price range in INR
GROUP BY hs.id, hs.name, hs.service_type, hp.company_name, hp.city, hp.state
ORDER BY starting_price;

-- 5. Get most popular subcategories across all services
SELECT 
    sub.subcategory_label,
    sub.subcategory_type,
    COUNT(DISTINCT sub.service_id) as service_count,
    ROUND(AVG(sub.price_per_hour), 2) as avg_price,
    MIN(sub.price_per_hour) as min_price,
    MAX(sub.price_per_hour) as max_price
FROM public.host_service_subcategories sub
JOIN public.host_services hs ON sub.service_id = hs.id
WHERE sub.is_active = true AND hs.is_active = true
GROUP BY sub.subcategory_key, sub.subcategory_label, sub.subcategory_type
ORDER BY service_count DESC, avg_price;

-- 6. Get subcategories by service type
SELECT 
    hs.service_type,
    sub.subcategory_label,
    COUNT(*) as provider_count,
    ROUND(AVG(sub.price_per_hour), 2) as avg_price,
    MIN(sub.price_per_hour) as min_price,
    MAX(sub.price_per_hour) as max_price
FROM public.host_service_subcategories sub
JOIN public.host_services hs ON sub.service_id = hs.id
WHERE sub.is_active = true AND hs.is_active = true
GROUP BY hs.service_type, sub.subcategory_key, sub.subcategory_label
ORDER BY hs.service_type, avg_price;

-- =====================================================
-- USING HELPER FUNCTIONS
-- =====================================================

-- 7. Use helper function to get service subcategories
SELECT * FROM get_service_subcategories('your-service-uuid-here');

-- 8. Use helper function to get host subcategories
SELECT * FROM get_host_subcategories('your-host-uuid-here');

-- 9. Search services by price range using function
SELECT * FROM search_services_by_price(
    p_min_price := 400,
    p_max_price := 800,
    p_service_type := 'guards',
    p_city := 'Mumbai'
);

-- 10. Get popular subcategories for guards
SELECT * FROM get_popular_subcategories('guards', 5);

-- 11. Get pricing summary for a service
SELECT * FROM get_service_pricing_summary('your-service-uuid-here');

-- =====================================================
-- INSERT/UPDATE EXAMPLES
-- =====================================================

-- 12. Insert subcategories for a new service
-- (Replace UUIDs with actual values)
INSERT INTO public.host_service_subcategories (
    service_id, host_id, subcategory_key, subcategory_label,
    subcategory_type, price_per_hour, currency, display_order
) VALUES 
('your-service-uuid', 'your-host-uuid', 'security_guard', 'Security Guard', 'predefined', 500.00, 'INR', 1),
('your-service-uuid', 'your-host-uuid', 'security_supervisor', 'Security Supervisor', 'predefined', 750.00, 'INR', 2),
('your-service-uuid', 'your-host-uuid', 'male_bouncer', 'Male Bouncer', 'predefined', 600.00, 'INR', 3),
('your-service-uuid', 'your-host-uuid', 'female_bouncer', 'Female Bouncer', 'predefined', 600.00, 'INR', 4),
('your-service-uuid', 'your-host-uuid', 'other', 'VIP Security Guard', 'custom', 1200.00, 'INR', 5);

-- 13. Update subcategory pricing
UPDATE public.host_service_subcategories 
SET price_per_hour = 550.00, updated_at = NOW()
WHERE service_id = 'your-service-uuid' 
AND subcategory_key = 'security_guard';

-- 14. Bulk upsert using helper function
SELECT upsert_service_subcategories(
    'your-service-uuid'::UUID,
    'your-host-uuid'::UUID,
    '{
        "security_guard": {
            "label": "Security Guard",
            "price_per_hour": "525.00",
            "currency": "INR",
            "description": "Professional security guard services"
        },
        "security_supervisor": {
            "label": "Security Supervisor", 
            "price_per_hour": "775.00",
            "currency": "INR",
            "description": "Experienced security supervisor"
        },
        "other": {
            "label": "Executive Protection Officer",
            "price_per_hour": "1500.00", 
            "currency": "INR",
            "description": "High-level executive protection"
        }
    }'::jsonb
);

-- =====================================================
-- ANALYTICS QUERIES
-- =====================================================

-- 15. Price distribution analysis
SELECT 
    CASE 
        WHEN price_per_hour < 300 THEN 'Budget (< ₹300)'
        WHEN price_per_hour BETWEEN 300 AND 600 THEN 'Standard (₹300-600)'
        WHEN price_per_hour BETWEEN 600 AND 1000 THEN 'Premium (₹600-1000)'
        ELSE 'Luxury (> ₹1000)'
    END as price_tier,
    COUNT(*) as subcategory_count,
    ROUND(AVG(price_per_hour), 2) as avg_price
FROM public.host_service_subcategories
WHERE is_active = true
GROUP BY 
    CASE 
        WHEN price_per_hour < 300 THEN 'Budget (< ₹300)'
        WHEN price_per_hour BETWEEN 300 AND 600 THEN 'Standard (₹300-600)'
        WHEN price_per_hour BETWEEN 600 AND 1000 THEN 'Premium (₹600-1000)'
        ELSE 'Luxury (> ₹1000)'
    END
ORDER BY avg_price;

-- 16. Geographic pricing analysis
SELECT 
    hp.state,
    hp.city,
    hs.service_type,
    COUNT(sub.id) as subcategory_count,
    ROUND(AVG(sub.price_per_hour), 2) as avg_hourly_rate,
    MIN(sub.price_per_hour) as min_rate,
    MAX(sub.price_per_hour) as max_rate
FROM public.host_service_subcategories sub
JOIN public.host_services hs ON sub.service_id = hs.id
JOIN public.host_profiles hp ON hs.host_id = hp.id
WHERE sub.is_active = true AND hs.is_active = true
GROUP BY hp.state, hp.city, hs.service_type
HAVING COUNT(sub.id) >= 2
ORDER BY hp.state, hp.city, avg_hourly_rate DESC;

-- 17. Host performance metrics
SELECT 
    hp.company_name,
    hp.full_name,
    COUNT(DISTINCT hs.id) as total_services,
    COUNT(sub.id) as total_subcategories,
    ROUND(AVG(sub.price_per_hour), 2) as avg_pricing,
    MIN(sub.price_per_hour) as min_pricing,
    MAX(sub.price_per_hour) as max_pricing
FROM public.host_profiles hp
JOIN public.host_services hs ON hp.id = hs.host_id
JOIN public.host_service_subcategories sub ON hs.id = sub.service_id
WHERE hs.is_active = true AND sub.is_active = true
GROUP BY hp.id, hp.company_name, hp.full_name
ORDER BY total_services DESC, avg_pricing;

-- =====================================================
-- VIEW USAGE EXAMPLES
-- =====================================================

-- 18. Use the service_subcategories_view for easy querying
SELECT 
    service_name,
    service_type,
    subcategory_label,
    price_per_hour,
    currency,
    host_name,
    company_name,
    city,
    state
FROM public.service_subcategories_view
WHERE service_type = 'guards'
AND city = 'Mumbai'
ORDER BY price_per_hour;

-- 19. Get all subcategories for a specific host using the view
SELECT 
    service_name,
    subcategory_label,
    price_per_hour,
    currency
FROM public.service_subcategories_view
WHERE host_name = 'Your Host Name'
ORDER BY service_name, price_per_hour;










