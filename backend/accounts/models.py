# The key issue is here:
# In the error message: "App 'accounts' doesn't have a 'User' model."
# Your settings.py has AUTH_USER_MODEL = 'accounts.User'
# But the accounts/models.py doesn't define a User model, it only has Car and CarImage.

# Here's a fix for accounts/models.py to add the User model:

# accounts/models.py
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _

class User(AbstractUser):
    """
    Custom User model extending the built-in AbstractUser
    """
    phone_number = models.CharField(_("Phone Number"), max_length=20, blank=True)
    is_military = models.BooleanField(_("Military Status"), default=False)
    military_id = models.CharField(_("Military ID"), max_length=100, blank=True)
    is_verified = models.BooleanField(_("Verified"), default=False)

    class Meta:
        verbose_name = _("user")
        verbose_name_plural = _("users")

class SellerRating(models.Model):
    """
    Rating system for sellers
    """
    RATING_CHOICES = [(i, i) for i in range(1, 6)]
    
    seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ratings')
    rater = models.ForeignKey(User, on_delete=models.CASCADE, related_name='given_ratings')
    rating = models.PositiveSmallIntegerField(choices=RATING_CHOICES)
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('seller', 'rater')