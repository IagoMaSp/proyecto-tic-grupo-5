from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('universities', '0003_photosuniversity_university_name_linker_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='wishlist',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='wishlist',
            name='updated_at',
            field=models.DateTimeField(auto_now=True),
        ),
    ]