class MissingPublication(Exception):
    def __init__(self, publication_id: str):
        message = f"Publication <{publication_id}> not in mapping"
        super().__init__(message)


class MissingEngine(Exception):
    def __init__(self, process: str):
        message = f"Could not find recommendation engine for <{process}>"
        super().__init__(message)