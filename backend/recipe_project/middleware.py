from django.http import JsonResponse
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.contrib.auth.models import User
import jwt
from django.conf import settings


class JWTAuthenticationFromCookieMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Skip middleware for certain paths
        skip_paths = ['/admin/', '/api/auth/login/', '/api/auth/register/']
        if any(request.path.startswith(path) for path in skip_paths):
            return self.get_response(request)

        # Try to get token from cookie
        access_token = request.COOKIES.get('access_token')
        
        if access_token:
            try:
                # Validate token
                UntypedToken(access_token)
                
                # Decode token to get user info
                decoded_token = jwt.decode(
                    access_token, 
                    settings.SECRET_KEY, 
                    algorithms=['HS256']
                )
                
                user_id = decoded_token.get('user_id')
                if user_id:
                    try:
                        user = User.objects.get(id=user_id)
                        request.user = user
                    except User.DoesNotExist:
                        pass
                        
            except (InvalidToken, TokenError, jwt.ExpiredSignatureError):
                # Token is invalid or expired
                pass

        return self.get_response(request)