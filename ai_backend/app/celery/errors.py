class MissingPublication(Exception):
    def __init__(self, publication_id: str):
        message = f"Publication <{publication_id}> not in mapping"
        super().__init__(message)


class MissingEngine(Exception):
    def __init__(self, process: str):
        message = f"Could not find recommendation engine for <{process}>"
        super().__init__(message)

    def __init__(self, process: str, error: Exception):
        message = f"Could not find recommendation engine for <{process}> because <{error}>"
        super().__init__(message)


class NoBackendData(Exception):
    def __init__(self, endpoint):
        message = f"Did not receive data from  <{endpoint}>"
        super().__init__(message)


class NoBackendConnection(Exception):
    def __init__(self, endpoint, error: Exception):
        message = f"Did not connect to  <{endpoint}> because <{error}>"
        super().__init__(message)


class EngineTaskTimedOut(Exception):
    def __init__(self, task, error: Exception):
        message = f"The task<{task}> timed out with : <{error}>"
        super().__init__(message)


class EngineError(Exception):
    def __init__(self, task, error: Exception):
        message = f"The task<{task}> failed because the engine raised: <{error}>"
        super().__init__(message)


class AtomicTaskRejectionError(Exception):
    def __init__(self, task):
        message = (f"The task<{task}> is an atomic task, meaning only one instance of it can be running. One instance "
                   f"is already being precessed therefore this task is rejected.")
        super().__init__(message)
