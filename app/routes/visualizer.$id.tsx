import {useLocation, useNavigate} from "react-router";
import {useEffect, useRef, useState} from "react";
import {generate3Dview} from "../../lib/ai.action";
import {Box, Download, RefreshCcw, Share2, X} from "lucide-react";
import Button from "../../Component/Button";

const VisualizerId = () => {
    const navigate= useNavigate();
    const location = useLocation();
    const {initialImage, initialRender, name} = location.state || {};
const hasInitialGenerated = useRef(false);
const [ isProcessing, setIsProcessing ] = useState(false);
const [ currentImage, setCurrentImage ] = useState<string | null>(initialRender || null);

const handleBack = () => navigate('/');
const runGeneration = async () => {
    if(!initialImage) return;
try {
    setIsProcessing(true);
    const result = await generate3Dview({sourceImage: initialImage});

    if (result.renderedImage) {
        setCurrentImage(result.renderedImage);
// update the project in the database with the rendered image.
    }
} catch (error) {
    console.error('Error generating 3D view:', error);
} finally {
    setIsProcessing(false);
}
}

useEffect(() => {
    if(!initialImage || hasInitialGenerated.current) return;
 if (initialRender) {
     setCurrentImage(initialRender);
     hasInitialGenerated.current = true;
     return;
 }
 hasInitialGenerated.current = true;
 runGeneration();
 }, [initialImage, initialRender]);

    return (
        <div className="visualizer">
            <nav className="topbar">
                <div className="brand">
                    <Box className="logo" />
                    <span className="name">Architect AI</span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleBack} className="exit">
                    <X classname="icon"/> Exit Editor
                </Button>
            </nav>
                <section className="content">
                    <div className="panel">
                        <div className="panel-header">
                            <div className="panel-meta">
                                <p>Projects</p>
                                <h2>{'Untitled Project'}</h2>
                                <p className="note">Created By YOU</p>
                            </div>
                            <div className="panel-actions">
                                <Button
                                    size="sm"
                                    onClick={() => {}}
                                      className="export"
                                    disabled={!currentImage}>
                                    <Download className="w-4 h-4 mr-2" /> Export
                                    </Button>
                                <Button
                                    size="sm"
                                    onClick={() => {}} className="share">
                                    <Share2 className="w-4 h-4 mr-2" /> Share
                                    </Button>/
                            </div>
                        </div>
                        <div className={`render-area ${isProcessing ? 'is-processing' : ''}`}>
                            {currentImage ? (
                                <img src={currentImage} alt="AI Rendered" className="render-img" />
                            ) : (
                                <div className="render-placeholder">
                                    {initialImage && (
                                        <img src={initialImage} alt="Original" className="render-fallback" />
                                    )}
                                </div>
                            )}

                            {isProcessing && (
                                <div className="render-overlay">
                                    <div className="rendering-card">
<RefreshCcw className="spinner" />
                                        <span className="title">Rendering....</span>
                                        <span className="subtitle">Generating 3D Floorplan</span>

                                        </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
                {initialImage && (
                    <div className="image-container">
                        <h2>Source Image</h2>
                        <img src={initialImage} alt="Source" />
                    </div>
                )}
            </div>
    );
};

export default VisualizerId;