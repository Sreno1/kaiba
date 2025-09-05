<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class DocsController extends Controller
{
    public function index()
    {
        $docsPath = base_path('docs');
        
        if (!File::exists($docsPath)) {
            return response()->json(['error' => 'Docs directory not found'], 404);
        }
        
        $files = File::files($docsPath);
        $docs = [];
        
        foreach ($files as $file) {
            if ($file->getExtension() === 'md') {
                $filename = $file->getFilename();
                $slug = Str::slug(pathinfo($filename, PATHINFO_FILENAME));
                
                $content = File::get($file->getRealPath());
                
                // Extract title from first heading
                $title = $this->extractTitle($content) ?: ucwords(str_replace('-', ' ', pathinfo($filename, PATHINFO_FILENAME)));
                
                $docs[] = [
                    'slug' => $slug,
                    'title' => $title,
                    'filename' => $filename,
                    'content' => $content,
                    'headings' => $this->extractHeadings($content),
                ];
            }
        }
        
        // Sort by title
        usort($docs, function ($a, $b) {
            return strcmp($a['title'], $b['title']);
        });
        
        return response()->json($docs);
    }
    
    public function show($slug)
    {
        $docsPath = base_path('docs');
        $files = File::files($docsPath);
        
        foreach ($files as $file) {
            if ($file->getExtension() === 'md') {
                $filename = $file->getFilename();
                $fileSlug = Str::slug(pathinfo($filename, PATHINFO_FILENAME));
                
                if ($fileSlug === $slug) {
                    $content = File::get($file->getRealPath());
                    $title = $this->extractTitle($content) ?: ucwords(str_replace('-', ' ', pathinfo($filename, PATHINFO_FILENAME)));
                    
                    return response()->json([
                        'slug' => $slug,
                        'title' => $title,
                        'filename' => $filename,
                        'content' => $content,
                        'headings' => $this->extractHeadings($content),
                    ]);
                }
            }
        }
        
        return response()->json(['error' => 'Document not found'], 404);
    }
    
    private function extractTitle($content)
    {
        if (preg_match('/^#\s+(.+)$/m', $content, $matches)) {
            return trim($matches[1]);
        }
        return null;
    }
    
    private function extractHeadings($content)
    {
        $headings = [];
        
        if (preg_match_all('/^(#{1,6})\s+(.+)$/m', $content, $matches, PREG_SET_ORDER)) {
            foreach ($matches as $match) {
                $level = strlen($match[1]);
                $text = trim($match[2]);
                $anchor = Str::slug($text);
                
                $headings[] = [
                    'level' => $level,
                    'text' => $text,
                    'anchor' => $anchor,
                ];
            }
        }
        
        return $headings;
    }
}