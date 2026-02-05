'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Check, Globe, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useAllTrainedModels, useUserAssignedModels, useAssignModelsToUser } from '../_services/user-models.queries';

interface User {
    id: string;
    name: string | null;
    email: string;
}

interface AssignModelsToUserProps {
    user: User;
    isOpen: boolean;
    onClose: () => void;
}

type ModelTypeFilter = 'all' | 'photo' | 'video' | 'audio';

export default function AssignModelsToUser({ user, isOpen, onClose }: AssignModelsToUserProps) {
    // State
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<ModelTypeFilter>('all');
    const [selectedModels, setSelectedModels] = useState<Set<string>>(new Set());
    
    // Queries
    const { data: allModels = [], isLoading: isLoadingModels } = useAllTrainedModels();
    const { data: assignedModels = [], isLoading: isLoadingAssigned } = useUserAssignedModels(user.id);
    const assignMutation = useAssignModelsToUser(user.id);

    // Initialize selected models when data loads
    useEffect(() => {
        if (assignedModels.length > 0) {
            const assignedIds = assignedModels.map(model => model.id);
            setSelectedModels(new Set(assignedIds));
        }
    }, [assignedModels, isOpen]);

    // Filter models
    const filteredModels = allModels.filter(model => {
        const matchesSearch = model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             model.externalId.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'all' || model.type === typeFilter;
        const isPublished = model.isPublished; // Only show published models
        
        return matchesSearch && matchesType && isPublished;
    });

    // Toggle model selection
    const handleToggleModel = (modelId: string) => {
        const newSelected = new Set(selectedModels);
        if (newSelected.has(modelId)) {
            newSelected.delete(modelId);
        } else {
            newSelected.add(modelId);
        }
        setSelectedModels(newSelected);
    };

    // Select all visible models
    const handleSelectAll = () => {
        if (selectedModels.size === filteredModels.length) {
            setSelectedModels(new Set());
        } else {
            const allVisibleIds = filteredModels.map(model => model.id);
            setSelectedModels(new Set(allVisibleIds));
        }
    };

    // Save assignments
    const handleSave = async () => {
        assignMutation.mutate(Array.from(selectedModels), {
            onSuccess: () => {
                onClose();
            }
        });
    };

    // Get type badge
    const getTypeBadge = (type: string) => {
        const config = {
            photo: { label: 'Photo', className: 'bg-blue-50 text-blue-700 border-blue-200' },
            video: { label: 'Video', className: 'bg-purple-50 text-purple-700 border-purple-200' },
            audio: { label: 'Audio', className: 'bg-orange-50 text-orange-700 border-orange-200' },
        };
        const cfg = config[type as keyof typeof config] || { label: type, className: 'bg-gray-50' };
        return cfg;
    };

    const isLoading = isLoadingModels || isLoadingAssigned;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent aria-describedby={undefined} className="rounded-lg bg-white overflow-y-auto sm:max-w-4xl max-h-[94vh]">
                <DialogHeader>
                    <DialogTitle>Assign Trained Models to User</DialogTitle>
                    <p className="text-sm text-gray-500">
                        Assign trained models to <span className="font-medium">{user.name || user.email}</span>
                    </p>
                </DialogHeader>

                {/* Filters */}
                <div className="p-4 border-b">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search models by name or ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4 text-gray-400" />
                                <select
                                    value={typeFilter}
                                    onChange={(e) => setTypeFilter(e.target.value as ModelTypeFilter)}
                                    className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">All Types</option>
                                    <option value="photo">Photo</option>
                                    <option value="video">Video</option>
                                    <option value="audio">Audio</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Models List */}
                <div className="flex-1 overflow-y-auto p-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                        </div>
                    ) : (
                        <>
                            {/* Selection Summary */}
                            <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-4">
                                    <Badge variant="secondary">
                                        {selectedModels.size} selected
                                    </Badge>
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                        {filteredModels.filter(m => m.assignToAll).length} Auto-Assigned to All
                                    </Badge>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleSelectAll}
                                    className="h-auto p-1 text-sm"
                                >
                                    {selectedModels.size === filteredModels.length ? 'Deselect All' : 'Select All'}
                                </Button>
                            </div>

                            {/* Models Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {filteredModels.map((model) => {
                                    const isSelected = selectedModels.has(model.id);
                                    const typeConfig = getTypeBadge(model.type);
                                    const isAutoAssigned = model.assignToAll;
                                    
                                    return (
                                        <div
                                            key={model.id}
                                            className={`p-4 border rounded-lg transition-all cursor-pointer ${isAutoAssigned ? 'bg-green-50 border-green-200' : isSelected ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'}`}
                                            onClick={() => !isAutoAssigned && handleToggleModel(model.id)}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="font-semibold">{model.name}</span>
                                                        {isAutoAssigned && (
                                                            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 text-xs">
                                                                <Globe className="h-3 w-3 mr-1" />
                                                                Auto-Assigned
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Badge variant="outline" className={`text-xs ${typeConfig.className}`}>
                                                            {typeConfig.label}
                                                        </Badge>
                                                        {model.groupName && (
                                                            <Badge variant="secondary" className="text-xs">
                                                                {model.groupName}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-500 font-mono mb-2">
                                                        ID: {model.externalId}
                                                    </p>
                                                </div>
                                                
                                                {/* Checkbox */}
                                                <div className="ml-2">
                                                    {isAutoAssigned ? (
                                                        <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
                                                            <Check className="h-3 w-3 text-green-600" />
                                                        </div>
                                                    ) : (
                                                        <div className={`h-5 w-5 border-2 rounded flex items-center justify-center ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                                                            {isSelected && <Check className="h-3 w-3 text-white" />}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            {/* Status indicator */}
                                            <div className="flex items-center justify-between mt-3 pt-3 border-t">
                                                <span className={`text-xs ${model.isPublished ? 'text-green-600' : 'text-gray-400'}`}>
                                                    {model.isPublished ? 'Published' : 'Unpublished'}
                                                </span>
                                                {isAutoAssigned && (
                                                    <span className="text-xs text-green-600">Automatically assigned to all users</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {filteredModels.length === 0 && (
                                <div className="text-center py-12 text-gray-500">
                                    <p>No published trained models found</p>
                                    <p className="text-sm mt-2">Try changing your search or filters</p>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <DialogFooter className="flex justify-between items-center pt-6 border-t">
                    <div className="text-sm text-gray-600">
                        <span className="font-medium">{selectedModels.size}</span> model{selectedModels.size !== 1 ? 's' : ''} selected
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleSave} 
                            disabled={assignMutation.isPending || isLoading}
                        >
                            {assignMutation.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Save Assignments'
                            )}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}