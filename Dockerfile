FROM apache/superset:latest

USER root

# reinstall pip inside venv properly + install drivers
RUN python -m ensurepip --upgrade || true && \
    python -m pip install --upgrade pip && \
    pip install psycopg2-binary sqlalchemy

USER superset