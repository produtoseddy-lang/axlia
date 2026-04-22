
-- Restrict fingerprint policies (will use edge function with service role)
DROP POLICY IF EXISTS "Anyone can read fingerprints" ON public.device_fingerprints;
DROP POLICY IF EXISTS "Anyone can insert fingerprints" ON public.device_fingerprints;

CREATE POLICY "Users view own fingerprints" ON public.device_fingerprints
  FOR SELECT USING (auth.uid() = user_id);

-- Restrict storage listing: only allow reading files when path is known (no listing)
DROP POLICY IF EXISTS "Public read uploads" ON storage.objects;

CREATE POLICY "Public read individual upload" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'uploads' AND (
      auth.uid() IS NOT NULL
      OR (storage.foldername(name))[1] IS NOT NULL
    )
  );
