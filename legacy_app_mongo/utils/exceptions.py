class BaseError(Exception):
    """Base exception class"""
    def __init__(self, message: str):
        self.message = message
        super().__init__(self.message)

class ValidationError(BaseError):
    """Raised when validation fails"""
    pass

class AuthenticationError(BaseError):
    """Raised when authentication fails"""
    pass

class AuthorizationError(BaseError):
    """Raised when user doesn't have permission"""
    pass

class ResourceNotFoundError(BaseError):
    """Raised when resource is not found"""
    pass

class DatabaseError(BaseError):
    """Raised when database operation fails"""
    pass

class CacheError(BaseError):
    """Raised when cache operation fails"""
    pass

class AIError(BaseError):
    """Raised when AI-related operations fail"""
    pass 