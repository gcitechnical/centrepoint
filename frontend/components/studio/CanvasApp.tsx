'use client';

import { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import {
    Loader2, Save, Download, Type, Image as ImageIcon, Undo,
    Palette, Layers, Square, Circle, MousePointer2,
    AlignLeft, AlignCenter, AlignRight, Bold, Italic,
    Trash2, Lock, Unlock, ChevronDown, Plus
} from 'lucide-react';
import { api } from '@/lib/api';

interface CanvasAppProps {
    designId?: string;
    templateId?: string;
    initialData?: any;
}

export default function CanvasApp({ designId, templateId, initialData }: CanvasAppProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);
    const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null);
    const [saving, setSaving] = useState(false);

    // UI State
    const [activeTab, setActiveTab] = useState<'elements' | 'text' | 'uploads' | 'history'>('elements');

    // Initialize Canvas
    useEffect(() => {
        if (!canvasRef.current || !containerRef.current) return;

        const canvas = new fabric.Canvas(canvasRef.current, {
            width: 800,
            height: 600,
            backgroundColor: '#ffffff',
            preserveObjectStacking: true,
        });

        // Set dimensions appropriately based on parent or fixed size
        const resizeCanvas = () => {
            if (containerRef.current) {
                // fixed ratio for church flyers usually 4:5 or 1:1
                // Let's stick to 800x600 for now but center it
            }
        };
        resizeCanvas();

        setFabricCanvas(canvas);

        // Initial Load
        if (initialData) {
            canvas.loadFromJSON(initialData, () => {
                canvas.renderAll();
            });
        }

        // Event Listeners
        canvas.on('selection:created', (e) => setSelectedObject(e.selected?.[0] || null));
        canvas.on('selection:updated', (e) => setSelectedObject(e.selected?.[0] || null));
        canvas.on('selection:cleared', () => setSelectedObject(null));
        canvas.on('object:moving', (e) => enforceLocks(e.target));

        return () => {
            canvas.dispose();
        };
    }, []);

    const enforceLocks = (obj: fabric.Object | undefined) => {
        if (!obj) return;
        if ((obj as any)._cp_locked) {
            obj.lockMovementX = true;
            obj.lockMovementY = true;
            obj.lockRotation = true;
            obj.lockScalingX = true;
            obj.lockScalingY = true;
            obj.hasControls = false;
        }
    };

    // --- Object Manipulation ---

    const addText = (type: 'heading' | 'subheading' | 'body' = 'body') => {
        if (!fabricCanvas) return;

        let options: any = {
            left: 100,
            top: 100,
            fontFamily: 'Inter',
            fill: '#333333'
        };

        if (type === 'heading') {
            options = { ...options, fontSize: 60, fontWeight: 'bold', text: 'HEADING TITLE' };
        } else if (type === 'subheading') {
            options = { ...options, fontSize: 30, fontWeight: 'semibold', text: 'Sub-heading text here' };
        } else {
            options = { ...options, fontSize: 18, text: 'This is a body text block for your church message.' };
        }

        const text = new fabric.IText(options.text, options);
        fabricCanvas.add(text);
        fabricCanvas.setActiveObject(text);
        fabricCanvas.renderAll();
    };

    const addShape = (shape: 'rect' | 'circle') => {
        if (!fabricCanvas) return;

        let obj;
        if (shape === 'rect') {
            obj = new fabric.Rect({
                left: 100,
                top: 100,
                fill: '#6366f1',
                width: 100,
                height: 100,
                rx: 8,
                ry: 8
            });
        } else {
            obj = new fabric.Circle({
                left: 100,
                top: 100,
                fill: '#10b981',
                radius: 50
            });
        }

        fabricCanvas.add(obj);
        fabricCanvas.setActiveObject(obj);
        fabricCanvas.renderAll();
    };

    const updateStyle = (key: string, value: any) => {
        if (!fabricCanvas || !selectedObject) return;
        selectedObject.set(key as any, value);
        fabricCanvas.renderAll();
        // Force state update for the UI
        setSelectedObject(Object.create(selectedObject));
    };

    const bringToFront = () => {
        if (!fabricCanvas || !selectedObject) return;
        selectedObject.bringToFront();
        fabricCanvas.renderAll();
    };

    const sendToBack = () => {
        if (!fabricCanvas || !selectedObject) return;
        selectedObject.sendToBack();
        fabricCanvas.renderAll();
    };

    const exportToImage = () => {
        if (!fabricCanvas) return;
        const dataURL = fabricCanvas.toDataURL({
            format: 'png',
            quality: 1,
            multiplier: 2 // High resolution export
        });
        const link = document.createElement('a');
        link.download = `centrepoint-design-${Date.now()}.png`;
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const deleteSelected = () => {
        if (!fabricCanvas || !selectedObject) return;
        fabricCanvas.remove(selectedObject);
        fabricCanvas.discardActiveObject();
        fabricCanvas.renderAll();
    };

    const handleSave = async () => {
        if (!fabricCanvas || !designId) return;
        setSaving(true);
        try {
            const json = fabricCanvas.toJSON(['_cp_locked', '_cp_zone', '_cp_role']);
            const previewUrl = fabricCanvas.toDataURL({ format: 'png', multiplier: 0.5 });

            await api.designs.update(designId, {
                canvas_json: json,
                thumbnail_url: previewUrl
            });
            // Show a subtle success indicator
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex h-full bg-slate-900 overflow-hidden text-white font-sans">
            {/* 1. Left Sidebar - Asset Library */}
            <div className="w-[300px] bg-slate-800 border-r border-slate-700 flex">
                <div className="w-20 border-r border-slate-700 flex flex-col items-center py-6 space-y-8">
                    <button onClick={() => setActiveTab('elements')} className={`p-3 rounded-xl transition ${activeTab === 'elements' ? 'bg-indigo-600 shadow-lg shadow-indigo-500/30' : 'hover:bg-slate-700 text-slate-400'}`}>
                        <Layers className="h-6 w-6" />
                    </button>
                    <button onClick={() => setActiveTab('text')} className={`p-3 rounded-xl transition ${activeTab === 'text' ? 'bg-indigo-600 shadow-lg shadow-indigo-500/30' : 'hover:bg-slate-700 text-slate-400'}`}>
                        <Type className="h-6 w-6" />
                    </button>
                    <button onClick={() => setActiveTab('uploads')} className={`p-3 rounded-xl transition ${activeTab === 'uploads' ? 'bg-indigo-600 shadow-lg shadow-indigo-500/30' : 'hover:bg-slate-700 text-slate-400'}`}>
                        <ImageIcon className="h-6 w-6" />
                    </button>
                </div>

                <div className="flex-1 p-6 overflow-y-auto bg-slate-800/50">
                    {activeTab === 'text' && (
                        <div className="space-y-6">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Text Sanctuary</h2>
                            <button onClick={() => addText('heading')} className="w-full py-5 px-6 bg-slate-700 rounded-2xl font-black text-left hover:bg-slate-600 transition group border border-transparent hover:border-indigo-500/30">
                                <span className="text-2xl block group-hover:scale-105 transition">Add Heading</span>
                            </button>
                            <button onClick={() => addText('subheading')} className="w-full py-4 px-6 bg-slate-700 rounded-2xl font-bold text-left hover:bg-slate-600 transition group border border-transparent hover:border-indigo-500/30">
                                <span className="text-lg block group-hover:scale-105 transition">Add Subheading</span>
                            </button>
                            <button onClick={() => addText('body')} className="w-full py-4 px-6 bg-slate-700 rounded-2xl font-medium text-left hover:bg-slate-600 transition group border border-transparent hover:border-indigo-500/30">
                                <span className="text-sm block text-slate-300">Add Body Text</span>
                            </button>
                        </div>
                    )}

                    {activeTab === 'elements' && (
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-6">Divine Geometry</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <button onClick={() => addShape('rect')} className="aspect-square bg-slate-700 rounded-2xl flex flex-col items-center justify-center gap-3 hover:bg-slate-600 transition group border border-transparent hover:border-indigo-500/30 shadow-inner">
                                        <Square className="h-10 w-10 text-indigo-400 group-hover:scale-110 transition" />
                                        <span className="text-[10px] uppercase font-black tracking-tighter text-slate-400">Box</span>
                                    </button>
                                    <button onClick={() => addShape('circle')} className="aspect-square bg-slate-700 rounded-2xl flex flex-col items-center justify-center gap-3 hover:bg-slate-600 transition group border border-transparent hover:border-indigo-500/30 shadow-inner">
                                        <Circle className="h-10 w-10 text-amber-400 group-hover:scale-110 transition" />
                                        <span className="text-[10px] uppercase font-black tracking-tighter text-slate-400">Circle</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 2. Main Workspace */}
            <div className="flex-1 flex flex-col" ref={containerRef}>
                {/* Editor Header */}
                <div className="h-20 border-b border-slate-700 bg-slate-800/80 backdrop-blur-xl px-8 flex items-center justify-between z-30">
                    <div className="flex items-center gap-6">
                        <div className="flex bg-slate-900 rounded-2xl p-1.5 border border-slate-700">
                            <button className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition"><Undo className="h-4 w-4" /></button>
                        </div>

                        {selectedObject && (
                            <div className="flex items-center gap-6 animate-in fade-in slide-in-from-left-4 duration-300">
                                <div className="h-8 w-[1px] bg-slate-700" />

                                <div className="flex items-center gap-2">
                                    <div className="relative group">
                                        <input
                                            type="color"
                                            className="w-10 h-10 rounded-xl border-2 border-slate-700 bg-slate-900 cursor-pointer overflow-hidden"
                                            onChange={(e) => updateStyle('fill', e.target.value)}
                                            value={typeof selectedObject.get('fill') === 'string' ? selectedObject.get('fill') as string : '#000000'}
                                        />
                                    </div>

                                    <div className="flex items-center gap-1 bg-slate-900 rounded-2xl p-1.5 border border-slate-700">
                                        <button onClick={bringToFront} title="Bring to Front" className="p-2 hover:bg-slate-800 rounded-xl transition text-slate-400 hover:text-white"><ChevronDown className="h-4 w-4 rotate-180" /></button>
                                        <button onClick={sendToBack} title="Send to Back" className="p-2 hover:bg-slate-800 rounded-xl transition text-slate-400 hover:text-white"><ChevronDown className="h-4 w-4" /></button>
                                    </div>

                                    {selectedObject.type?.includes('text') && (
                                        <div className="flex items-center gap-1 bg-slate-900 rounded-2xl p-1.5 border border-slate-700">
                                            <button onClick={() => updateStyle('fontWeight', (selectedObject as any).get('fontWeight') === 'bold' ? 'normal' : 'bold')} className={`p-2 rounded-xl transition ${(selectedObject as any).get('fontWeight') === 'bold' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}><Bold className="h-4 w-4" /></button>
                                            <button onClick={() => updateStyle('fontStyle', (selectedObject as any).get('fontStyle') === 'italic' ? 'normal' : 'italic')} className={`p-2 rounded-xl transition ${(selectedObject as any).get('fontStyle') === 'italic' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}><Plus className="h-4 w-4 rotate-45" /></button>
                                        </div>
                                    )}
                                </div>

                                <button onClick={deleteSelected} className="p-3 text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 rounded-2xl transition border border-rose-500/20 focus:scale-95">
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-slate-900 text-white border border-slate-700 px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 hover:bg-slate-800 transition shadow-xl"
                        >
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 text-indigo-400" />}
                            Save
                        </button>
                        <button
                            onClick={exportToImage}
                            className="bg-gradient-to-br from-amber-400 to-amber-600 text-indigo-950 px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 shadow-lg shadow-amber-900/40 hover:scale-105 active:scale-95 transition-all"
                        >
                            <Download className="h-4 w-4" /> Export PNG
                        </button>
                    </div>
                </div>

                {/* Canvas Workspace */}
                <div className="flex-1 bg-slate-900/50 overflow-auto flex items-center justify-center relative p-20 custom-scrollbar shadow-inner">
                    {/* Floating Background Texture (Spiritual feel) */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

                    <div className="relative group/canvas">
                        <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-500/20 to-amber-500/20 rounded-[2rem] blur-2xl opacity-0 group-hover/canvas:opacity-100 transition-opacity duration-1000"></div>
                        <div className="relative shadow-[0_0_150px_rgba(0,0,0,0.8)] border-[12px] border-slate-800/80 rounded-[2rem] overflow-hidden bg-white ring-1 ring-slate-700/50">
                            <canvas ref={canvasRef} />
                        </div>

                        {/* Status Float */}
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-800/90 backdrop-blur px-6 py-2 rounded-full border border-slate-700 shadow-2xl flex items-center gap-3 group-hover/canvas:translate-y-[-10px] transition-all">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]"></div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Sanctuary Canvas Live</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Right Sidebar - Layer/Info Controls (Optional/Simplified) */}
            <div className="w-[80px] bg-slate-800 border-l border-slate-700 flex flex-col items-center py-6 space-y-8">
                <button className="p-3 bg-slate-700 rounded-xl text-indigo-400">
                    <MousePointer2 className="h-6 w-6" />
                </button>
                <div className="h-[1px] w-8 bg-slate-700" />
                <button className="p-3 hover:bg-slate-700 rounded-xl text-slate-400">
                    <Palette className="h-6 w-6" />
                </button>
                <button className="p-3 hover:bg-slate-700 rounded-xl text-slate-400">
                    <Layers className="h-6 w-6" />
                </button>
            </div>
        </div>
    );
}
