import dagster
from dagster import (
    Definitions,
    ScheduleDefinition,
    define_asset_job,
    load_assets_from_package_module,
    EnvVar,
)

from . import assets
from dagster_gcp.gcs import GCSResource
from dagster_azure.adls2.resources import ADLS2Resource, ADLS2Key

daily_refresh_schedule = ScheduleDefinition(
    job=define_asset_job(name="all_assets_job"), cron_schedule="0 0 * * *"
)

defs = Definitions(
    assets=load_assets_from_package_module(assets), schedules=[daily_refresh_schedule],
    resources={
        "gcs": GCSResource(project=EnvVar("GOOGLE_APPLICATION_CREDENTIALS")),
        "adls2": ADLS2Resource(
            storage_account=EnvVar("AZURE_ACCOUNT_NAME"),
            credential=ADLS2Key(key=EnvVar("AZURE_STORAGE_KEY"))
        ),
    }
)
