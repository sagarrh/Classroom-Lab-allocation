"use client"
import React, { useState } from 'react';
import { Stage, Layer, Rect, Text, Group } from 'react-konva';
import { useRouter } from 'next/navigation';
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import { motion } from 'framer-motion';

const FloorLayout = () => {
    const router = useRouter();
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [hoveredRoom, setHoveredRoom] = useState(null);

    // Adjusted building dimensions for better proportions
    const buildingOutline = { x: 100, y: 45, width: 750, height: 600 };
    
    // Pastel color palette
    const colors = {
        wall: '#6D6875',
        floor: '#FFFAFA',
        selected: '#B5EAD7',
        hover: '#E2F0CB',
        classroom: '#FFDAC1',
        lab: '#C7CEEA',
        text: '#2D3748',
        corridor: '#F8EDEB',
        accent: '#FF9AA2',
        background: '#F9F9F9'
    };

    // Define corridor (centered vertically)
    const corridorWidth = 60;
    const corridorX = buildingOutline.width/2 - corridorWidth/2 + buildingOutline.x;
    const corridors = [
        { 
            x: corridorX, 
            y: buildingOutline.y, 
            width: corridorWidth, 
            height: buildingOutline.height 
        },
    ];

    // Room dimensions and positions
    const roomWidth = 200;
    const roomHeight = 120;
    const labWidth = 200;
    const labHeight = 100;
    const gap = 30; // Uniform gap between rooms and corridor

    // Define classrooms (left side of corridor)
    const classrooms = [
        { 
            id: '66', 
            x: corridorX - gap - roomWidth, 
            y: buildingOutline.y + 80, 
            width: roomWidth, 
            height: roomHeight, 
            label: 'Room 66', 
            type: 'classroom'
        },
        { 
            id: '65', 
            x: corridorX - gap - roomWidth, 
            y: buildingOutline.y + 250, 
            width: roomWidth, 
            height: roomHeight, 
            label: 'Room 65', 
            type: 'classroom'
        },
        { 
            id: '64', 
            x: corridorX - gap - roomWidth, 
            y: buildingOutline.y + 420, 
            width: roomWidth, 
            height: roomHeight, 
            label: 'Room 64', 
            type: 'classroom'
        },
    ];
    
    // Define labs (right side of corridor)
    const labs = [
        { 
            id: 'lab-3', 
            x: corridorX + corridorWidth + gap, 
            y: buildingOutline.y + 80, 
            width: labWidth, 
            height: labHeight, 
            label: 'Lab 3', 
            type: 'lab'
        },
        { 
            id: 'lab-2', 
            x: corridorX + corridorWidth + gap, 
            y: buildingOutline.y + 220, 
            width: labWidth, 
            height: labHeight, 
            label: 'Lab 2', 
            type: 'lab'
        },
        { 
            id: 'lab-1', 
            x: corridorX + corridorWidth + gap, 
            y: buildingOutline.y + 360, 
            width: labWidth, 
            height: labHeight, 
            label: 'Lab 1', 
            type: 'lab'
        },
        { 
            id: 'HOD Cabin', 
            x: corridorX + corridorWidth + gap, 
            y: buildingOutline.y + 500, 
            width: 150, 
            height: 80, 
            label: 'HOD Cabin', 
            type: 'office'
        },
    ];

    const allRooms = [...classrooms, ...labs];

    const handleRoomClick = (room) => {
        if (room.id === 'HOD Cabin') return;
        setSelectedRoom(room);
    };

    const handleRoomHover = (room) => {
        if (room.type !== 'office') { // Disable hover for HOD Cabin
            setHoveredRoom(room);
        }
    };

    const handleRoomLeave = () => {
        setHoveredRoom(null);
    };

    const getRoomColor = (room) => {
        if (selectedRoom && selectedRoom.id === room.id) return colors.selected;
        if (hoveredRoom && hoveredRoom.id === room.id) return colors.hover;
        return room.type === 'lab' ? colors.lab : 
               room.type === 'office' ? colors.accent : colors.classroom;
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen py-8 px-4 sm:px-6 lg:px-8"
            style={{ backgroundColor: colors.background }}
        >
            <div className="max-w-5xl mx-auto">
                <motion.div
                    initial={{ y: -20 }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="mb-8 text-center"
                >
                    <h1 className="font-bold text-4xl font-[Inter] text-[#6D6875] mb-2">
                        IT Department Floor Layout
                    </h1>
                    <p className="text-lg text-gray-600">
                        Select a room to view availability and schedule
                    </p>
                </motion.div>

                <motion.div 
                    whileHover={{ scale: 1.01 }}
                    className="bg-white rounded-xl shadow-lg p-6 mb-8 overflow-auto"
                >
                    <Stage width={850} height={700}>
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
                                cornerRadius={10}
                                shadowColor="#00000020"
                                shadowBlur={10}
                                shadowOffset={{ x: 2, y: 2 }}
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

                            {/* Rooms */}
                            {allRooms.map((room) => (
                                <Group 
                                    key={room.id} 
                                    onClick={() => handleRoomClick(room)}
                                    onMouseEnter={() => handleRoomHover(room)}
                                    onMouseLeave={handleRoomLeave}
                                >
                                    <Rect
                                        x={room.x}
                                        y={room.y}
                                        width={room.width}
                                        height={room.height}
                                        fill={getRoomColor(room)}
                                        stroke={colors.wall}
                                        strokeWidth={1.5}
                                        cornerRadius={5}
                                        shadowColor="#00000020"
                                        shadowBlur={hoveredRoom && hoveredRoom.id === room.id ? 10 : 5}
                                        shadowOpacity={0.3}
                                        shadowOffset={{ x: 2, y: 2 }}
                                    />
                                    <Text
                                        text={room.label}
                                        x={room.x + room.width/2 - (room.label.length * 4)}
                                        y={room.y + room.height/2 - 8}
                                        fontSize={14}
                                        fontFamily="Inter"
                                        fill={colors.text}
                                        fontStyle={selectedRoom && selectedRoom.id === room.id ? 'bold' : 'normal'}
                                    />
                                </Group>
                            ))}
                        </Layer>
                    </Stage>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h3 className="text-xl font-semibold text-[#6D6875] mb-4">Selected Room Details</h3>
                        {selectedRoom ? (
                            <div className="space-y-3">
                                <div className="flex items-center">
                                    <div className="w-3 h-3 rounded-full mr-2" 
                                         style={{ 
                                             backgroundColor: selectedRoom.type === 'lab' ? colors.lab : 
                                                            selectedRoom.type === 'office' ? colors.accent : colors.classroom 
                                         }} 
                                    />
                                    <p className="text-lg font-medium">{selectedRoom.label}</p>
                                </div>
                                <p className="text-gray-600">Room ID: {selectedRoom.id}</p>
                                <p className="text-gray-600 capitalize">Type: {selectedRoom.type}</p>
                            </div>
                        ) : (
                            <p className="text-gray-500 italic">Click on a room to see details</p>
                        )}
                    </div>

                    <motion.div 
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center justify-center"
                    >
                        <button 
                            onClick={() => router.push(`/time?roomId=${selectedRoom?.id}`)} 
                            className="w-full px-8 py-4 bg-gradient-to-r from-[#B5EAD7] to-[#C7CEEA] text-[#2D3748] font-semibold flex items-center justify-center gap-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!selectedRoom}
                        >
                            <span>Check Availability</span>
                            <ArrowRightIcon className="w-5 h-5" />
                        </button>
                    </motion.div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mt-8 flex justify-center"
                >
                    <div className="flex space-x-4">
                        <div className="flex items-center">
                            <div className="w-4 h-4 rounded-sm mr-2" style={{ backgroundColor: colors.classroom }} />
                            <span className="text-sm">Classroom</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-4 h-4 rounded-sm mr-2" style={{ backgroundColor: colors.lab }} />
                            <span className="text-sm">Lab</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-4 h-4 rounded-sm mr-2" style={{ backgroundColor: colors.accent }} />
                            <span className="text-sm">Office</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-4 h-4 rounded-sm mr-2" style={{ backgroundColor: colors.selected }} />
                            <span className="text-sm">Selected</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default FloorLayout;