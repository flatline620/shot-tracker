import React, { useState } from 'react';
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import './css/ShooterInfo.css'; // Ensure the correct path to the CSS file

const SortableShooter = ({ shooter, handleRemoveShooter }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: shooter.name });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <li ref={setNodeRef} style={style}>
            <button
                type="button"
                className="drag-handle"
                aria-label={`Reorder ${shooter.name}`}
                title="Drag to reorder"
                {...attributes}
                {...listeners}
            >
                ⠿
            </button>
            <span className="name-column">{shooter.name}</span>
            <button className="remove-button" type="button" onClick={() => handleRemoveShooter(shooter.name)}>
                Remove
            </button>
        </li>
    );
};

const ShooterInfo = ({ shooters, newShooter, setNewShooter, handleAddShooter, handleRemoveShooter, onReorderShooters, rotateShooters, setRotateShooters }) => {
   const [showInfo, setShowInfo] = useState(false); // State to manage the visibility of the info modal
   const sensors = useSensors(
       useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
       useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
   );

   // Check if the add shooter input should be marked as invalid
   const isShooterInputInvalid = newShooter.trim() === '';

   const handleInfoClick = () => {
       setShowInfo(true); // Show the info modal
   };

   const handleCloseModal = () => {
       setShowInfo(false); // Close the info modal
   };

   const handleDragEnd = ({ active, over }) => {
       if (!over || active.id === over.id) return;

       const oldIndex = shooters.findIndex(shooter => shooter.name === active.id);
       const newIndex = shooters.findIndex(shooter => shooter.name === over.id);
       if (oldIndex !== -1 && newIndex !== -1) {
           onReorderShooters(arrayMove(shooters, oldIndex, newIndex));
       }
   };

   return (
    <div className="shooters-section">
        <h2>Shooter Info</h2>
        
        <div className="rotate-shooters-container">
            <label htmlFor="rotateShooters">
                <input
                    type="checkbox"
                    id="rotateShooters"
                    checked={rotateShooters}
                    onChange={(e) => setRotateShooters(e.target.checked)}
                />
                Rotate First Shooter
                {/* Info Icon */}
                <span className="info-icon" onClick={handleInfoClick}>
                    ℹ️
                </span>
            </label>
        </div>

        <div className={`input-row ${isShooterInputInvalid ? 'invalid' : ''}`}>
            <input
            type="text"
            value={newShooter}
            onChange={(e) => setNewShooter(e.target.value)}
            placeholder="Add new shooter"
            className={isShooterInputInvalid ? 'invalid' : ''}
            />
            <button
            type="button"
            onClick={handleAddShooter}
            className={isShooterInputInvalid ? 'disabled' : ''}
            disabled={isShooterInputInvalid}
            >
            Add Shooter
            </button>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={shooters.map(shooter => shooter.name)} strategy={verticalListSortingStrategy}>
                <ul>
                    {shooters.map(shooter => (
                        <SortableShooter key={shooter.name} shooter={shooter} handleRemoveShooter={handleRemoveShooter} />
                    ))}
                </ul>
            </SortableContext>
        </DndContext>

        {/* Info Modal */}
        {showInfo && (
            <div className="info-modal">
                <div className="modal-content">
                    <span className="close-btn" onClick={handleCloseModal}>X</span>
                    <h3>Rotate Shooters Info</h3>
                    <p>
                        Selecting this option will allow the shooters to rotate who shoots first at the next station. 
                        If this is not selected, the first shooter in the list will shoot first at every station.
                    </p>
                </div>
            </div>
        )}
    </div>
   );
};

export default ShooterInfo;
