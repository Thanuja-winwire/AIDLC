from fastapi import APIRouter

from app.api import auth, catalog, insights, locations_stock, operations, purchasing, sales, suppliers, users

api_router = APIRouter(prefix="/api")
for module in (auth, users, catalog, locations_stock, suppliers, purchasing, operations, sales, insights):
    api_router.include_router(module.router)
