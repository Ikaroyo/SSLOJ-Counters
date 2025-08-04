import React, { useMemo } from "react";
import { BarChart3, TrendingUp, Users, Target, Award, Crown } from "lucide-react";

const Statistics = ({ characters, roleNames, elementNames }) => {
    // Calculate counter statistics
    const counterStats = useMemo(() => {
        const counterCount = {};
        const positionCount = {};
        const roleCounters = {};
        const elementCounters = {};

        // Count all counters
        characters.forEach(character => {
            if (character.counters && character.counters.length > 0) {
                character.counters.forEach(counter => {
                    const counterId = counter.id;
                    const counterChar = characters.find(c => c.id === counterId);

                    if (counterChar) {
                        // Count total usage
                        counterCount[counterId] = (counterCount[counterId] || 0) + 1;

                        // Count by position
                        positionCount[counter.position] = (positionCount[counter.position] || 0) + 1;

                        // Count by role
                        const role = counterChar.role;
                        roleCounters[role] = (roleCounters[role] || 0) + 1;

                        // Count by element
                        const element = counterChar.element;
                        elementCounters[element] = (elementCounters[element] || 0) + 1;
                    }
                });
            }
        });

        // Sort counters by usage
        const sortedCounters = Object.entries(counterCount)
            .map(([id, count]) => {
                const character = characters.find(c => c.id === id);
                return { character, count };
            })
            .filter(item => item.character)
            .sort((a, b) => b.count - a.count);

        // Calculate percentages
        const totalCounters = Object.values(counterCount).reduce((sum, count) => sum + count, 0);

        return {
            counterCount,
            positionCount,
            roleCounters,
            elementCounters,
            sortedCounters,
            totalCounters,
            totalCharacters: characters.length,
            charactersWithCounters: characters.filter(c => c.counters && c.counters.length > 0).length
        };
    }, [characters]);

    const getPositionName = (position) => {
        switch (position) {
            case 'front': return 'Línea Delantera';
            case 'back': return 'Línea Trasera';
            case 'opposite': return 'Posición Opuesta';
            case 'any': return 'Cualquier Posición';
            default: return position;
        }
    };

    const getPositionColor = (position) => {
        switch (position) {
            case 'front': return 'bg-red-500';
            case 'back': return 'bg-blue-500';
            case 'opposite': return 'bg-purple-500';
            case 'any': return 'bg-green-500';
            default: return 'bg-gray-500';
        }
    };

    const getRoleColor = (role) => {
        const colors = {
            1: 'bg-blue-500',    // Protector
            2: 'bg-red-500',     // Guerrero
            3: 'bg-purple-500',  // Habilidad
            4: 'bg-orange-500',  // Asesino
            5: 'bg-green-500',   // Asistente
        };
        return colors[role] || 'bg-gray-500';
    };

    const getElementColor = (element) => {
        const colors = {
            1: 'bg-blue-400',    // Agua
            2: 'bg-red-500',     // Fuego
            3: 'bg-gray-400',    // Aire
            4: 'bg-amber-600',   // Tierra
            5: 'bg-yellow-400',  // Luz
            6: 'bg-purple-600',  // Oscuridad
        };
        return colors[element] || 'bg-gray-500';
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                    📊 Estadísticas de Counters
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                    Análisis de los personajes más utilizados como counters
                </p>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
                    <div className="flex items-center gap-3">
                        <Users size={24} />
                        <div>
                            <p className="text-blue-100 text-sm">Total Personajes</p>
                            <p className="text-2xl font-bold">{counterStats.totalCharacters}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
                    <div className="flex items-center gap-3">
                        <Target size={24} />
                        <div>
                            <p className="text-green-100 text-sm">Con Counters</p>
                            <p className="text-2xl font-bold">{counterStats.charactersWithCounters}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
                    <div className="flex items-center gap-3">
                        <Award size={24} />
                        <div>
                            <p className="text-purple-100 text-sm">Total Counters</p>
                            <p className="text-2xl font-bold">{counterStats.totalCounters}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 text-white">
                    <div className="flex items-center gap-3">
                        <TrendingUp size={24} />
                        <div>
                            <p className="text-orange-100 text-sm">Promedio/Personaje</p>
                            <p className="text-2xl font-bold">
                                {counterStats.charactersWithCounters > 0
                                    ? (counterStats.totalCounters / counterStats.charactersWithCounters).toFixed(1)
                                    : '0'
                                }
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Counters */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                    <Crown className="text-yellow-500" size={24} />
                    Top 10 Counters Más Utilizados
                </h4>

                {counterStats.sortedCounters.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <Target size={48} className="mx-auto mb-2 opacity-50" />
                        <p>No hay datos de counters disponibles</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {counterStats.sortedCounters.slice(0, 10).map((item, index) => {
                            const percentage = ((item.count / counterStats.totalCounters) * 100).toFixed(1);
                            return (
                                <div key={item.character.id} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                        {index + 1}
                                    </div>

                                    <img
                                        src={item.character.image}
                                        alt={item.character.name}
                                        className="w-12 h-12 rounded-lg object-cover"
                                    />

                                    <div className="flex-1">
                                        <h5 className="font-semibold text-gray-800 dark:text-white">
                                            {item.character.name} - {item.character.title}
                                        </h5>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {roleNames[item.character.role]} • {elementNames[item.character.element]}
                                            {item.character.rank === "SS" && (
                                                <span className="ml-2 px-2 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded text-xs font-bold">
                                                    SS RANK
                                                </span>
                                            )}
                                        </p>
                                    </div>

                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-gray-800 dark:text-white">{item.count}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{percentage}%</p>
                                    </div>

                                    <div className="w-24 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
                                            style={{ width: `${Math.min(percentage, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Position Statistics */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                    <BarChart3 className="text-blue-500" size={24} />
                    Distribución por Posición
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.entries(counterStats.positionCount).map(([position, count]) => {
                        const percentage = ((count / counterStats.totalCounters) * 100).toFixed(1);
                        return (
                            <div key={position} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className={`w-3 h-3 rounded-full ${getPositionColor(position)}`} />
                                    <h5 className="font-semibold text-gray-800 dark:text-white text-sm">
                                        {getPositionName(position)}
                                    </h5>
                                </div>
                                <p className="text-2xl font-bold text-gray-800 dark:text-white">{count}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{percentage}%</p>
                                <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full mt-2">
                                    <div
                                        className={`h-full rounded-full ${getPositionColor(position)}`}
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Role and Element Statistics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Role Distribution */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                        Counters por Rol
                    </h4>
                    <div className="space-y-3">
                        {Object.entries(counterStats.roleCounters)
                            .sort(([, a], [, b]) => b - a)
                            .map(([role, count]) => {
                                const percentage = ((count / counterStats.totalCounters) * 100).toFixed(1);
                                return (
                                    <div key={role} className="flex items-center gap-3">
                                        <div className={`w-4 h-4 rounded ${getRoleColor(parseInt(role))}`} />
                                        <span className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {roleNames[role]}
                                        </span>
                                        <span className="text-sm font-bold text-gray-800 dark:text-white">
                                            {count} ({percentage}%)
                                        </span>
                                    </div>
                                );
                            })}
                    </div>
                </div>

                {/* Element Distribution */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                        Counters por Elemento
                    </h4>
                    <div className="space-y-3">
                        {Object.entries(counterStats.elementCounters)
                            .sort(([, a], [, b]) => b - a)
                            .map(([element, count]) => {
                                const percentage = ((count / counterStats.totalCounters) * 100).toFixed(1);
                                return (
                                    <div key={element} className="flex items-center gap-3">
                                        <div className={`w-4 h-4 rounded ${getElementColor(parseInt(element))}`} />
                                        <span className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {elementNames[element]}
                                        </span>
                                        <span className="text-sm font-bold text-gray-800 dark:text-white">
                                            {count} ({percentage}%)
                                        </span>
                                    </div>
                                );
                            })}
                    </div>
                </div>
            </div>

            {/* Additional Insights */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg p-6 border border-indigo-200 dark:border-indigo-800">
                <h4 className="text-xl font-bold text-indigo-800 dark:text-indigo-200 mb-4">
                    💡 Insights
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-indigo-700 dark:text-indigo-300 mb-2">
                            <strong>Counter más popular:</strong>
                        </p>
                        {counterStats.sortedCounters.length > 0 && (
                            <p className="text-indigo-600 dark:text-indigo-400">
                                {counterStats.sortedCounters[0].character.name} con {counterStats.sortedCounters[0].count} usos
                            </p>
                        )}
                    </div>
                    <div>
                        <p className="text-indigo-700 dark:text-indigo-300 mb-2">
                            <strong>Posición más usada:</strong>
                        </p>
                        {Object.entries(counterStats.positionCount).length > 0 && (
                            <p className="text-indigo-600 dark:text-indigo-400">
                                {getPositionName(Object.entries(counterStats.positionCount)
                                    .sort(([, a], [, b]) => b - a)[0][0])}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Statistics;
