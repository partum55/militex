from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class Fundraiser(models.Model):
    title = models.CharField(_('Title'), max_length=200)
    description = models.TextField(_('Description'))
    target_amount = models.DecimalField(_('Target Amount'), max_digits=10, decimal_places=2)
    current_amount = models.DecimalField(_('Current Amount'), max_digits=10, decimal_places=2, default=0)
    image = models.ImageField(upload_to='fundraiser_images/', blank=True, null=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    is_active = models.BooleanField(_('Active'), default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    @property
    def progress_percentage(self):
        if self.target_amount <= 0:
            return 0
        return min(int((self.current_amount / self.target_amount) * 100), 100)


class Donation(models.Model):
    fundraiser = models.ForeignKey(Fundraiser, on_delete=models.CASCADE, related_name='donations')
    donor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    amount = models.DecimalField(_('Amount'), max_digits=10, decimal_places=2)
    message = models.TextField(_('Message'), blank=True)
    anonymous = models.BooleanField(_('Anonymous'), default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        if self.anonymous:
            return f"Anonymous donation of {self.amount} to {self.fundraiser.title}"
        if self.donor:
            return f"{self.donor.username} donated {self.amount} to {self.fundraiser.title}"
        return f"Guest donated {self.amount} to {self.fundraiser.title}"
