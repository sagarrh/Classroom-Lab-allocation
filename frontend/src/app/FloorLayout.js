"use client"
import React, { useState } from 'react';
import { Stage, Layer, Rect, Text, Group, Line } from 'react-konva';
import { useRouter } from 'next/navigation'
import { ArrowRightIcon } from "@heroicons/react/24/solid";

const FloorLayout = () => {
    const router = useRouter()
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
    ];

    // Define classroom and lab positions and dimensions
    const classrooms = [
        { id: '66', x: 60, y: 60, width: 170, height: 100, label: 'Room 66', door: { x: 155, y: 160,  } },
        { id: '65', x: 60, y: 220, width: 170, height: 100, label: 'Room 65', door: { x: 155, y: 220,  } },
        { id: '64', x: 60, y: 340, width: 170, height: 100, label: 'Room 64', door: { x: 155, y: 340,  } },
    ];
    
    

    const labs = [
        { id: 'lab-3', x: 300, y: 60, width: 170, height: 75, label: 'Lab 3', door: { x: 330, y: 150,  } },
        { id: 'lab-2', x: 300, y: 170, width: 170, height: 85, label: 'Lab 2', door: { x: 330, y: 170,  } },
        { id: 'lab-1', x: 300, y: 290, width: 170, height: 85, label: 'Lab 1', door: { x: 330, y: 290,  } },
        { id: 'HOD Cabin', x: 350, y: 410, width: 120, height: 30, label: 'HOD Cabin  ', door: { x: 330, y: 410,  } },
    ];

    // Handler when a room is clicked
    const handleRoomClick = (room) => {
        setSelectedRoom(room);
        // console.log('Selected Room:', room);
    };

    // Draw door
    const renderDoor = (door) => {
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
        <>
        <div>
        <h1 className="font-bold text-4xl font-[Inter]">IT Department Floor Layout</h1>
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
                                        
                    </Layer>
            </Stage>
            <h3 style={{ marginTop: '20px' }}>Selected Room Details</h3>
            <div style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
                {selectedRoom ? (
                    <>
                        <p><strong>ID:</strong> {selectedRoom.id}</p>
                        {/* <p><strong>Coordinates:</strong> ({selectedRoom.x}, {selectedRoom.y})</p>
                        <p><strong>Dimensions:</strong> {selectedRoom.width} x {selectedRoom.height}</p> */}
                    </>
                ) : (
                    <p>No room selected</p>
                )}       
            </div>
            
            <button 
            onClick={() => router.push(`/time?roomId=${selectedRoom?.id}`)} 
            className="mt-4 px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold flex items-center justify-center gap-3 rounded-xl shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!selectedRoom}
            >
            Next <ArrowRightIcon className="w-4 h-4" />
            </button>




            
        </div>                                    
        </>
    );
};

export default FloorLayout;