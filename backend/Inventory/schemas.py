from pydantic import BaseModel
from typing import Optional, List

class InventoryCreate(BaseModel):
    name: str
    quantity: int
    description: Optional[str] = None

    class Config:
        orm_mode = True

class InventoryOut(InventoryCreate):
    id: int
    isDeleted: bool

class InventoryUpdate(BaseModel):
    name: Optional[str] = None
    quantity: Optional[int] = None
    description: Optional[str] = None

    class Config:
        orm_mode = True

# New schema for bulk operations
class BulkItemImport(BaseModel):
    items: List[InventoryCreate]
