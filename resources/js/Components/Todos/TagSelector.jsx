import React from "react";
import { Button } from "@/Components/ui";

export default function TagSelector({ tags, selectedTagIds, onChange }) {
    const handleToggleTag = (tagId) => {
        if (selectedTagIds.includes(tagId)) {
            onChange(selectedTagIds.filter((id) => id !== tagId));
        } else {
            onChange([...selectedTagIds, tagId]);
        }
    };

    return (
        <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
                <Button
                    key={tag.id}
                    type="button"
                    variant={selectedTagIds.includes(tag.id) ? "default" : "outline"}
                    className="px-3 py-1 text-xs rounded-full"
                    style={{ backgroundColor: selectedTagIds.includes(tag.id) ? tag.color : undefined, color: selectedTagIds.includes(tag.id) ? "#fff" : undefined }}
                    onClick={() => handleToggleTag(tag.id)}
                >
                    {tag.name}
                </Button>
            ))}
        </div>
    );
}
