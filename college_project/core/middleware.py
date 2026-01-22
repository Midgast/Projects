# Example for custom middleware (not required for MVP, but placeholder for future)
from django.utils.deprecation import MiddlewareMixin

class ExampleMiddleware(MiddlewareMixin):
    def process_request(self, request):
        pass
