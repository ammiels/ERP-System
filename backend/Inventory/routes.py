from fastapi import HTTPException, APIRouter, status, Depends, Response
from Inventory.dependencies import db_dependency, get_admin_user
from Inventory.models import Inventory
from Inventory.schemas import InventoryCreate, InventoryOut, InventoryUpdate, BulkItemImport
from Requests.models import Request, RequestStatus
import csv
import io
import json
from typing import List
from fastapi.responses import StreamingResponse

router = APIRouter(prefix="/inventory", tags=["Inventory"])

@router.post("/", response_model=InventoryOut)
def create_item(item: InventoryCreate, db: db_dependency, user=Depends(get_admin_user)):
    existing_item = db.query(Inventory).filter(Inventory.name == item.name).first()
    if existing_item:
        raise HTTPException(status_code=400, detail="Item already exists")
    new_item = Inventory(**item.model_dump(), isDeleted=False)
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

@router.get("/", response_model=list[InventoryOut])
def list_items(db: db_dependency):
    return db.query(Inventory).filter(Inventory.isDeleted == False).all()

@router.put("/{item_id}", response_model=InventoryOut)
def update_item(item_id: int, item: InventoryUpdate, db: db_dependency, user=Depends(get_admin_user)):
    db_item = db.query(Inventory).filter(Inventory.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    update_data = item.model_dump(exclude_unset=True)
    if "name" in update_data:
        existing_item = db.query(Inventory).filter(
            Inventory.name == update_data["name"],
            Inventory.id != item_id
        ).first()
        if existing_item:
            raise HTTPException(status_code=400, detail="Another item with that name already exists")
    for field, value in update_data.items():
        setattr(db_item, field, value)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/{item_id}")
def delete_item(item_id: int, db: db_dependency, user=Depends(get_admin_user)):
    item = db.query(Inventory).filter(Inventory.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    any_requests = db.query(Request).filter(Request.inventory_id == item.id).all()
    if not any_requests:
        db.delete(item)
        db.commit()
        return {"message": "Item deleted successfully"}
    pending = any(r.status == RequestStatus.pending for r in any_requests)
    if pending:
        raise HTTPException(status_code=400, detail="Cannot delete item: Pending requests must be handled first")
    item.isDeleted = True
    db.commit()
    return {"message": "Item set to deleted"}
    
# New bulk import endpoint
@router.post("/bulk-import", response_model=dict)
def bulk_import(import_data: BulkItemImport, db: db_dependency, user=Depends(get_admin_user)):
    """
    Import multiple inventory items at once
    """
    successful_imports = 0
    failed_imports = 0
    failures = []
    
    for item_data in import_data.items:
        try:
            # Check if item already exists
            existing_item = db.query(Inventory).filter(Inventory.name == item_data.name).first()
            if existing_item:
                failures.append({"name": item_data.name, "reason": "Item already exists"})
                failed_imports += 1
                continue
                
            # Create new item
            new_item = Inventory(**item_data.model_dump(), isDeleted=False)
            db.add(new_item)
            successful_imports += 1
        except Exception as e:
            failures.append({"name": item_data.name if hasattr(item_data, "name") else "Unknown", 
                             "reason": str(e)})
            failed_imports += 1
    
    db.commit()
    
    return {
        "message": f"Import complete. {successful_imports} items imported successfully, {failed_imports} failed.",
        "successful_imports": successful_imports,
        "failed_imports": failed_imports,
        "failures": failures
    }

# Export to CSV endpoint
@router.get("/export/csv")
def export_csv(db: db_dependency):
    """
    Export all inventory items as CSV
    """
    items = db.query(Inventory).filter(Inventory.isDeleted == False).all()
    
    # Create a string buffer for CSV data
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write CSV header
    writer.writerow(["id", "name", "quantity", "description"])
    
    # Write data rows
    for item in items:
        writer.writerow([item.id, item.name, item.quantity, item.description or ""])
    
    # Return CSV as downloadable file
    response = StreamingResponse(iter([output.getvalue()]), 
                                media_type="text/csv")
    response.headers["Content-Disposition"] = f"attachment; filename=inventory-export.csv"
    
    return response

# Export to JSON endpoint
@router.get("/export/json", response_model=List[InventoryOut])
def export_json(db: db_dependency):
    """
    Export all inventory items as JSON
    """
    return db.query(Inventory).filter(Inventory.isDeleted == False).all()
