from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from assets.models import Asset
from rooms.models import Room
from users.models import UserProfile


@api_view(['GET'])
@permission_classes([AllowAny])
def dashboard_summary_view(request):
    total_assets = Asset.objects.count()
    damaged_assets = Asset.objects.filter(condition='Damaged').count()
    good_assets = Asset.objects.filter(condition='Good').count()
    total_rooms = Room.objects.count()
    total_users = UserProfile.objects.count()
    
    return Response({
        'total_assets': total_assets,
        'damaged_assets': damaged_assets,
        'good_assets': good_assets,
        'total_rooms': total_rooms,
        'total_users': total_users
    })
