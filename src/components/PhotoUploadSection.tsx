import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Camera, ChevronDown, ChevronUp, Trash2, Image } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const PHOTO_CATEGORIES = ["Before", "During", "After", "Issue Found", "Equipment Label"] as const;
type PhotoCategory = typeof PHOTO_CATEGORIES[number];

interface Photo {
  id: string;
  dataUrl: string;
  category: PhotoCategory;
  caption: string;
  timestamp: number;
}

interface PhotoUploadSectionProps {
  jobId: string;
  isOpen: boolean;
  onToggle: () => void;
}

const MAX_WIDTH = 1200;
const STORAGE_KEY_PREFIX = "job_photos_";

const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.createElement("img");
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = (height * MAX_WIDTH) / width;
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
};

export const PhotoUploadSection: React.FC<PhotoUploadSectionProps> = ({
  jobId,
  isOpen,
  onToggle,
}) => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<PhotoCategory>("Before");
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const storageKey = `${STORAGE_KEY_PREFIX}${jobId}`;

  // Load photos from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setPhotos(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load photos from storage:", error);
    }
  }, [storageKey]);

  // Save photos to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(photos));
    } catch (error) {
      console.error("Failed to save photos to storage:", error);
      toast({
        title: "Storage warning",
        description: "Could not save photos. Storage may be full.",
        variant: "destructive",
      });
    }
  }, [photos, storageKey]);

  const handleAddPhoto = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    const newPhotos: Photo[] = [];

    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file",
          description: `${file.name} is not an image`,
          variant: "destructive",
        });
        continue;
      }

      try {
        const dataUrl = await compressImage(file);
        newPhotos.push({
          id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          dataUrl,
          category: selectedCategory,
          caption: "",
          timestamp: Date.now(),
        });
      } catch (error) {
        console.error("Failed to process image:", error);
        toast({
          title: "Processing failed",
          description: `Could not process ${file.name}`,
          variant: "destructive",
        });
      }
    }

    if (newPhotos.length > 0) {
      setPhotos((prev) => [...prev, ...newPhotos]);
      toast({
        title: "Photos added",
        description: `${newPhotos.length} photo(s) added successfully`,
      });
    }

    setIsProcessing(false);
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDeletePhoto = (photoId: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
    toast({
      title: "Photo deleted",
      description: "Photo removed successfully",
    });
  };

  const handleCaptionChange = (photoId: string, caption: string) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === photoId ? { ...p, caption } : p))
    );
  };

  const photoCount = photos.length;

  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <Card className="overflow-hidden">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full flex items-center justify-between p-4 min-h-[56px] rounded-none"
          >
            <div className="flex items-center gap-3">
              <Image className="h-5 w-5 text-primary" />
              <span className="font-semibold text-base">Photos</span>
              {photoCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {photoCount}
                </Badge>
              )}
            </div>
            {isOpen ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="p-4 pt-0 space-y-4">
            {/* Category Selection */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Select category before adding photo:
              </p>
              <div className="flex flex-wrap gap-2">
                {PHOTO_CATEGORIES.map((category) => (
                  <Button
                    key={category}
                    type="button"
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    className="min-h-[40px]"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            {/* Add Photo Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full min-h-[48px] gap-2"
              onClick={handleAddPhoto}
              disabled={isProcessing}
            >
              <Camera className="h-5 w-5" />
              {isProcessing ? "Processing..." : "Add Photo"}
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Photo Grid */}
            {photos.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {photos.map((photo) => (
                  <div key={photo.id} className="space-y-2">
                    <div className="relative group">
                      <img
                        src={photo.dataUrl}
                        alt={photo.caption || photo.category}
                        className="w-full h-[150px] object-cover rounded-lg border"
                      />
                      <Badge
                        variant="secondary"
                        className="absolute top-2 left-2 text-xs"
                      >
                        {photo.category}
                      </Badge>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 opacity-90"
                        onClick={() => handleDeletePhoto(photo.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <Input
                      type="text"
                      placeholder="Add caption..."
                      value={photo.caption}
                      onChange={(e) => handleCaptionChange(photo.id, e.target.value)}
                      className="text-sm"
                    />
                  </div>
                ))}
              </div>
            )}

            {photos.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-4">
                No photos added yet
              </p>
            )}
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
