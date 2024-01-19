class MissingPublication(Exception):
    def __init__(self, publication_id: str):
        message = f"Publication <{publication_id}> not in mapping"
        super().__init__(message)


class MissingEngine(Exception):
    def __init__(self, process: str):
        message = f"Could not find recommendation engine for <{process}>"
        super().__init__(message)


class NoBackendData(Exception):
    def __init__(self, client):
        message = f"Did not receive data from  <{client}>"
        super().__init__(message)


class EngineTaskTimedOut(Exception):
    def __init__(self, task, error: Exception):
        message = f"The task<{task}> timed out with : <{error}>"
        super().__init__(message)
