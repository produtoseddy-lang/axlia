REVOKE EXECUTE ON FUNCTION public.apply_referral(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.apply_referral(TEXT) TO authenticated;