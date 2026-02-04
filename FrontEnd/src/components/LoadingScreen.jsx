import React, { useState, useEffect } from 'react';

const LoadingScreen = () => {
    const messages = [
        "Waking up the hamsters... 🐹",
        "Free hosting takes time... blame Render, not me 😔",
        "Spinning up the server (it was napping)... 😴",
        "Loading... please wait while we find your data in the cloud ☁️",
        "Almost there... (hopefully) 🤞",
        "Calculating the meaning of life... 42 🤖",
        "Just a moment, converting coffee to code ☕",
        "Patience is a virtue... but this is ridiculous 🐢"
    ];

    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
        }, 3000); // Change message every 3 seconds

        return () => clearInterval(interval);
    }, [messages.length]);

    return (
        <div className="w-full h-screen flex flex-col justify-center items-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <div className="relative flex justify-center items-center mb-8">
                {/* Outer pulsing ring */}
                <div className="absolute animate-ping inline-flex h-24 w-24 rounded-full bg-blue-400 opacity-25"></div>

                {/* Inner spinner */}
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 dark:border-blue-400"></div>
            </div>

            <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4 animate-pulse">
                Study Mate
            </h2>

            <div className="h-12 flex items-center justify-center">
                <p className="text-md md:text-lg text-gray-600 dark:text-gray-400 text-center px-4 italic transition-opacity duration-500 ease-in-out">
                    {messages[currentMessageIndex]}
                </p>
            </div>
        </div>
    );
};

export default LoadingScreen;
