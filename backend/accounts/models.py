from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _


class User(AbstractUser):
    phone_number = models.CharField(_('Phone Number'), max_length=20, blank=True)
    is_military = models.BooleanField(_('Military Status'), default=False)

    # Optional military verification
    military_id = models.CharField(_('Military ID'), max_length=100, blank=True)
    is_verified = models.BooleanField(_('Verified'), default=False)

    def __str__(self):
        return self.username


class SellerRating(models.Model):
    seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ratings')
    rater = models.ForeignKey(User, on_delete=models.CASCADE, related_name='given_ratings')
    rating = models.PositiveSmallIntegerField(choices=[(i, i) for i in range(1, 6)])
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('seller', 'rater')

    def __str__(self):
        return f"{self.rater.username} rated {self.seller.username}: {self.rating}"
