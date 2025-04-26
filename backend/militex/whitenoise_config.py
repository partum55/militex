from whitenoise.storage import CompressedManifestStaticFilesStorage

class CustomWhiteNoiseStorage(CompressedManifestStaticFilesStorage):
    """
    Custom WhiteNoise storage that extends the CompressedManifestStaticFilesStorage
    to handle static files in production environment.
    
    This adds manifest-based caching while still enabling compression.
    """
    manifest_strict = False
