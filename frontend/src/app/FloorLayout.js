"use client"
import React, { useState } from 'react';
import { Stage, Layer, Rect, Text, Group, Line, Circle } from 'react-konva';

const FloorLayout = () => {
    const [selectedRoom, setSelectedRoom] = useState(null);

    // Building outline
    const buildingOutline = { x: 40, y: 40, width: 520, height: 420 };
    
    // Colors for architectural layout
    const colors = {
        wall: '#333333',
        floor: '#f5f5f5',
        selected: '#ADD8E6',
        classroom: '#E0E0E0',
        lab: '#D3D3D3',
        door: '#8B4513',
        text: '#000000',
        corridor: '#EEEEEE'
    };

    // Define corridor
    const corridors = [
        { x: 250, y: 40, width: 30, height: 420 }, // Main corridor
        { x: 40, y: 175, width: 210, height: 30 }, // Horizontal corridor for classrooms
        { x: 280, y: 150, width: 280, height: 20 }, // Horizontal corridor for labs
        { x: 280, y: 270, width: 280, height: 20 }, // Horizontal corridor for labs
        { x: 280, y: 390, width: 280, height: 20 }, // Horizontal corridor for labs
    ];

    // Define classroom and lab positions and dimensions
    const classrooms = [
        { id: 'classroom-101', x: 60, y: 60, width: 170, height: 100, label: 'Room 101', door: { x: 155, y: 160, direction: 'bottom' } },
        { id: 'classroom-102', x: 60, y: 220, width: 170, height: 100, label: 'Room 102', door: { x: 155, y: 220, direction: 'top' } },
        { id: 'classroom-103', x: 60, y: 340, width: 170, height: 100, label: 'Room 103', door: { x: 155, y: 340, direction: 'top' } },
    ];

    const labs = [
        { id: 'lab-201', x: 300, y: 60, width: 170, height: 75, label: 'Lab 201', door: { x: 330, y: 150, direction: 'bottom' } },
        { id: 'lab-202', x: 300, y: 170, width: 170, height: 85, label: 'Lab 202', door: { x: 330, y: 170, direction: 'top' } },
        { id: 'lab-203', x: 300, y: 290, width: 170, height: 85, label: 'Lab 203', door: { x: 330, y: 290, direction: 'top' } },
        { id: 'lab-204', x: 300, y: 410, width: 170, height: 30, label: 'Storage', door: { x: 330, y: 410, direction: 'top' } },
    ];

    // Common areas
    const commonAreas = [
        { id: 'restroom', x: 480, y: 60, width: 60, height: 75, label: 'WC', door: { x: 500, y: 150, direction: 'bottom' } },
        { id: 'elevator', x: 480, y: 170, width: 60, height: 85, label: 'Lift', symbol: 'elevator' },
        { id: 'stairs', x: 480, y: 290, width: 60, height: 85, label: 'Stairs', symbol: 'stairs' },
    ];

    // Handler when a room is clicked
    const handleRoomClick = (room) => {
        setSelectedRoom(room);
        console.log('Selected Room:', room);
    };

    // Draw door
    const renderDoor = (door, room) => {
        const doorLength = 20;
        let points = [];
        
        if (door.direction === 'bottom') {
            points = [door.x - doorLength/2, door.y, door.x + doorLength/2, door.y, door.x + doorLength/2, door.y + 5, door.x - doorLength/2, door.y + 5];
        } else if (door.direction === 'top') {
            points = [door.x - doorLength/2, door.y, door.x + doorLength/2, door.y, door.x + doorLength/2, door.y - 5, door.x - doorLength/2, door.y - 5];
        }
        
        return <Line points={points} stroke={colors.door} strokeWidth={1.5} />;
    };

    return (
        <div>
            <h2>Building Floor Plan</h2>
            <Stage width={600} height={500}>
                <Layer>
                    {/* Building outline */}
                    <Rect
                        x={buildingOutline.x}
                        y={buildingOutline.y}
                        width={buildingOutline.width}
                        height={buildingOutline.height}
                        stroke={colors.wall}
                        strokeWidth={4}
                        fill={colors.floor}
                    />

                    {/* Corridors */}
                    {corridors.map((corridor, index) => (
                        <Rect
                            key={`corridor-${index}`}
                            x={corridor.x}
                            y={corridor.y}
                            width={corridor.width}
                            height={corridor.height}
                            fill={colors.corridor}
                            stroke={colors.wall}
                            strokeWidth={1}
                        />
                    ))}

                    {/* Classrooms */}
                    {classrooms.map((room) => (
                        <Group key={room.id} onClick={() => handleRoomClick(room)}>
                            <Rect
                                x={room.x}
                                y={room.y}
                                width={room.width}
                                height={room.height}
                                fill={selectedRoom && selectedRoom.id === room.id ? colors.selected : colors.classroom}
                                stroke={colors.wall}
                                strokeWidth={2}
                            />
                            <Text
                                text={room.label}
                                x={room.x + room.width/2 - 30}
                                y={room.y + room.height/2 - 8}
                                fontSize={14}
                                fill={colors.text}
                            />
                            {room.door && renderDoor(room.door, room)}
                        </Group>
                    ))}

                    {/* Labs */}
                    {labs.map((room) => (
                        <Group key={room.id} onClick={() => handleRoomClick(room)}>
                            <Rect
                                x={room.x}
                                y={room.y}
                                width={room.width}
                                height={room.height}
                                fill={selectedRoom && selectedRoom.id === room.id ? colors.selected : colors.lab}
                                stroke={colors.wall}
                                strokeWidth={2}
                            />
                            <Text
                                text={room.label}
                                x={room.x + room.width/2 - 25}
                                y={room.y + room.height/2 - 8}
                                fontSize={14}
                                fill={colors.text}
                            />
                            {room.door && renderDoor(room.door, room)}
                        </Group>
                    ))}
                    
                    {/* Common Areas */}
                    {commonAreas.map((room) => (
                        <Group key={room.id} onClick={() => handleRoomClick(room)}>
                            <Rect
                                x={room.x}
                                y={room.y}
                                width={room.width}
                                height={room.height}
                                fill={selectedRoom && selectedRoom.id === room.id ? colors.selected : '#DCDCDC'}
                                stroke={colors.wall}
                                strokeWidth={2}
                            />
                            <Text
                                text={room.label}
                                x={room.x + room.width/2 - 10}
                                y={room.y + room.height/2 - 8}
                                fontSize={12}
                                fill={colors.text}
                            />
                            {room.door && renderDoor(room.door, room)}
                        </Group>
                    ))}

                    {/* North arrow */}
                    <Group x={520} y={430}>
                        <Circle radius={15} fill="white" stroke={colors.wall} />
                        <Line points={[0, -12, 0, 12]} stroke={colors.wall} strokeWidth={2} />
                        <Line points={[0, -12, -5, -5]} stroke={colors.wall} strokeWidth={2} />
                        <Line points={[0, -12, 5, -5]} stroke={colors.wall} strokeWidth={2} />
                        <Text text="N" x={-5} y={0} fontSize={10} />
                    </Group>
                </Layer>
            </Stage>
            
            {selectedRoom && (
                <div style={{ marginTop: '20px' }}>
                    <h3>Selected Room: {selectedRoom.label}</h3>
                    <p><strong>ID:</strong> {selectedRoom.id}</p>
                </div>
            )}
        </div>
    );
};

export default FloorLayout;