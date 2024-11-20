from setuptools import find_packages, setup

setup(
    name="arxiv-etl",
    packages=find_packages(exclude=["arxiv-etl_tests"]),
    install_requires=[
        "dagster",
        "dagster-cloud",
        "dagster-azure",
        "dagster-gcp",
        "dagster-dask",
        "dask[complete]",
        "boto3",
        "pandas",
        "matplotlib",
        "pyarrow",
        "pymupdf"
    ],
    extras_require={"dev": ["dagster-webserver", "pytest"]},
)
