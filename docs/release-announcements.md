# Release Announcements Setup Guide

This guide explains how to set up automatic release announcements for self-hosted Kaiba installations using Kibo UI components and GitHub releases.

## Table of Contents

1. [Overview](#overview)
2. [GitHub Release Management](#github-release-management)
3. [Version Strategy](#version-strategy)
4. [Setting Up Kibo UI Announcement Component](#setting-up-kibo-ui-announcement-component)
5. [Backend Implementation](#backend-implementation)
6. [Frontend Implementation](#frontend-implementation)
7. [Configuration for Self-Hosters](#configuration-for-self-hosters)
8. [Testing Your Setup](#testing-your-setup)
9. [Troubleshooting](#troubleshooting)

## Overview

This system allows self-hosted Kaiba instances to automatically display announcements when new releases are available on GitHub. The system supports three release types:

- **Alpha** (pre-release, cutting-edge features)
- **Beta** (release candidate, stable features)  
- **Live** (stable production release)

Users will see a dismissible announcement banner when their installed version doesn't match the latest release for their chosen release channel.

## GitHub Release Management

### 1. Setting Up Your Repository for Releases

#### Initial Setup
```bash
# Ensure your repository is properly configured
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Add version to your application
echo "1.0.0" > VERSION
git add VERSION
git commit -m "Add version file for release tracking"
```

#### Creating Your First Release

1. **Via GitHub Web Interface** (Recommended for first-time publishers):
   - Go to your repository on GitHub
   - Click "Releases" in the right sidebar
   - Click "Create a new release"
   - Choose "Create new tag" and enter version (e.g., `v1.0.0`)
   - Select target branch (usually `main`)
   - Fill in release title and description
   - Check "Set as a pre-release" for alpha/beta versions

2. **Via Command Line** (For experienced users):
   ```bash
   # Create and push a tag
   git tag -a v1.0.0 -m "Release version 1.0.0"
   git push origin v1.0.0
   
   # Create release using GitHub CLI
   gh release create v1.0.0 --title "Version 1.0.0" --notes "Initial release"
   ```

### 2. Release Versioning Strategy

#### Semantic Versioning (SemVer)
Use the format `MAJOR.MINOR.PATCH`:
- **MAJOR**: Breaking changes (1.0.0 → 2.0.0)
- **MINOR**: New features, backward compatible (1.0.0 → 1.1.0)
- **PATCH**: Bug fixes (1.0.0 → 1.0.1)

#### Release Channel Tags
```bash
# Alpha releases (pre-release flag required)
v1.2.0-alpha.1
v1.2.0-alpha.2

# Beta releases (pre-release flag required)  
v1.2.0-beta.1
v1.2.0-beta.2

# Live/Stable releases (no pre-release flag)
v1.2.0
```

### 3. Creating Releases for Each Channel

#### Alpha Release
```bash
# Tag the release
git tag -a v1.2.0-alpha.1 -m "Alpha release 1.2.0-alpha.1"
git push origin v1.2.0-alpha.1

# Create GitHub release (mark as pre-release)
gh release create v1.2.0-alpha.1 \
  --title "v1.2.0-alpha.1" \
  --notes "Alpha release with experimental features" \
  --prerelease
```

#### Beta Release  
```bash
# Tag the release
git tag -a v1.2.0-beta.1 -m "Beta release 1.2.0-beta.1"
git push origin v1.2.0-beta.1

# Create GitHub release (mark as pre-release)
gh release create v1.2.0-beta.1 \
  --title "v1.2.0-beta.1" \
  --notes "Beta release - release candidate" \
  --prerelease
```

#### Live Release
```bash
# Tag the release  
git tag -a v1.2.0 -m "Live release 1.2.0"
git push origin v1.2.0

# Create GitHub release (stable)
gh release create v1.2.0 \
  --title "v1.2.0" \
  --notes "Stable release with new features and bug fixes"
```

## Version Strategy

### 1. Update Application Version

Create a version configuration in your Laravel application:

```php
// config/app.php
'version' => env('APP_VERSION', '1.0.0'),
'github_repo' => env('GITHUB_REPO', 'yourusername/kaiba'),
'release_channel' => env('RELEASE_CHANNEL', 'live'), // alpha, beta, live
```

### 2. Environment Configuration

Add to your `.env.example`:
```env
APP_VERSION=1.0.0
GITHUB_REPO=yourusername/kaiba
RELEASE_CHANNEL=live
GITHUB_TOKEN= # Optional: for higher API rate limits
```

## Setting Up Kibo UI Announcement Component

### 1. Install Kibo UI Announcement Component

The Kibo UI announcement component provides a polished way to display release notifications.

#### Manual Installation
Create the component files:

```bash
mkdir -p resources/js/Components/ui/kibo-ui/announcement
```

Create `resources/js/Components/ui/kibo-ui/announcement/index.jsx`:
```jsx
import { ComponentProps, HTMLAttributes } from "react";
import { Badge } from "@/Components/ui/badge";
import { cn } from "@/lib/utils";

export const Announcement = ({ 
  variant = "outline", 
  themed = false, 
  className, 
  ...props 
}) => (
  <Badge
    className={cn(
      "group max-w-full gap-2 rounded-full bg-background px-3 py-0.5 font-medium shadow-sm transition-all",
      "hover:shadow-md",
      themed && "announcement-themed border-foreground/5",
      className
    )}
    variant={variant}
    {...props}
  />
);

export const AnnouncementTag = ({ className, ...props }) => (
  <div
    className={cn(
      "-ml-2.5 shrink-0 truncate rounded-full bg-foreground/5 px-2.5 py-1 text-xs",
      "group-[.announcement-themed]:bg-background/60",
      className
    )}
    {...props}
  />
);

export const AnnouncementTitle = ({ className, ...props }) => (
  <div
    className={cn("flex items-center gap-1 truncate py-1", className)}
    {...props}
  />
);
```

### 2. Create Badge Component (if not exists)

Create `resources/js/Components/ui/badge.jsx`:
```jsx
import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Badge = React.forwardRef(({ className, variant, ...props }, ref) => {
  return (
    <div ref={ref} className={cn(badgeVariants({ variant }), className)} {...props} />
  );
});
Badge.displayName = "Badge";

export { Badge, badgeVariants };
```

## Backend Implementation

### 1. Create Release Service

Create `app/Services/ReleaseService.php`:
```php
<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class ReleaseService
{
    private string $repo;
    private string $currentVersion;
    private string $releaseChannel;
    private ?string $githubToken;

    public function __construct()
    {
        $this->repo = config('app.github_repo');
        $this->currentVersion = config('app.version');
        $this->releaseChannel = config('app.release_channel', 'live');
        $this->githubToken = config('app.github_token');
    }

    public function getLatestRelease(): ?array
    {
        return Cache::remember(
            "latest_release_{$this->releaseChannel}",
            now()->addHours(1),
            fn() => $this->fetchLatestRelease()
        );
    }

    public function hasNewRelease(): bool
    {
        $latestRelease = $this->getLatestRelease();
        
        if (!$latestRelease) {
            return false;
        }

        return version_compare(
            $this->normalizeVersion($latestRelease['tag_name']),
            $this->normalizeVersion($this->currentVersion),
            '>'
        );
    }

    public function getAnnouncementData(): ?array
    {
        if (!$this->hasNewRelease()) {
            return null;
        }

        $release = $this->getLatestRelease();
        
        return [
            'version' => $release['tag_name'],
            'name' => $release['name'],
            'body' => $release['body'],
            'url' => $release['html_url'],
            'published_at' => $release['published_at'],
            'channel' => $this->determineChannel($release['tag_name']),
            'current_version' => $this->currentVersion,
        ];
    }

    private function fetchLatestRelease(): ?array
    {
        try {
            $headers = [];
            if ($this->githubToken) {
                $headers['Authorization'] = "Bearer {$this->githubToken}";
            }

            $url = match ($this->releaseChannel) {
                'alpha' => "https://api.github.com/repos/{$this->repo}/releases",
                'beta' => "https://api.github.com/repos/{$this->repo}/releases",  
                'live' => "https://api.github.com/repos/{$this->repo}/releases/latest",
            };

            $response = Http::withHeaders($headers)->get($url);

            if (!$response->successful()) {
                Log::warning("Failed to fetch releases: " . $response->status());
                return null;
            }

            $releases = $response->json();

            if ($this->releaseChannel === 'live') {
                return $releases['prerelease'] ? null : $releases;
            }

            // Filter releases by channel for alpha/beta
            foreach (is_array($releases) ? $releases : [$releases] as $release) {
                if ($this->matchesChannel($release['tag_name'], $this->releaseChannel)) {
                    return $release;
                }
            }

            return null;
        } catch (\Exception $e) {
            Log::error("Error fetching release data: " . $e->getMessage());
            return null;
        }
    }

    private function matchesChannel(string $version, string $channel): bool
    {
        return match ($channel) {
            'alpha' => str_contains($version, '-alpha'),
            'beta' => str_contains($version, '-beta'),
            'live' => !str_contains($version, '-alpha') && !str_contains($version, '-beta'),
        };
    }

    private function determineChannel(string $version): string
    {
        if (str_contains($version, '-alpha')) return 'alpha';
        if (str_contains($version, '-beta')) return 'beta';
        return 'live';
    }

    private function normalizeVersion(string $version): string
    {
        // Remove 'v' prefix and channel suffixes for comparison
        $version = ltrim($version, 'v');
        return explode('-', $version)[0];
    }
}
```

### 2. Create API Controller

Create `app/Http/Controllers/Api/ReleaseController.php`:
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ReleaseService;
use Illuminate\Http\JsonResponse;

class ReleaseController extends Controller
{
    public function __construct(
        private ReleaseService $releaseService
    ) {}

    public function checkForUpdates(): JsonResponse
    {
        $announcement = $this->releaseService->getAnnouncementData();
        
        return response()->json([
            'has_update' => $announcement !== null,
            'announcement' => $announcement,
        ]);
    }

    public function dismissAnnouncement(): JsonResponse
    {
        // Store dismissal in session or user preferences
        session(['release_announcement_dismissed' => now()->timestamp]);
        
        return response()->json(['success' => true]);
    }
}
```

### 3. Add API Routes

Add to `routes/api.php`:
```php
use App\Http\Controllers\Api\ReleaseController;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/releases/check-updates', [ReleaseController::class, 'checkForUpdates']);
    Route::post('/releases/dismiss-announcement', [ReleaseController::class, 'dismissAnnouncement']);
});
```

### 4. Register Service Provider

Add to `config/app.php` in the providers array:
```php
App\Providers\ReleaseServiceProvider::class,
```

Create `app/Providers/ReleaseServiceProvider.php`:
```php
<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\ReleaseService;

class ReleaseServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(ReleaseService::class);
    }

    public function boot(): void
    {
        //
    }
}
```

## Frontend Implementation

### 1. Create Release Announcement Hook

Create `resources/js/hooks/useReleaseAnnouncement.js`:
```jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

export function useReleaseAnnouncement() {
    const [announcement, setAnnouncement] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDismissed, setIsDismissed] = useState(() => {
        return localStorage.getItem('release_announcement_dismissed') === 'true';
    });

    useEffect(() => {
        checkForUpdates();
    }, []);

    const checkForUpdates = async () => {
        try {
            const response = await axios.get('/api/releases/check-updates');
            
            if (response.data.has_update && !isDismissed) {
                setAnnouncement(response.data.announcement);
            }
        } catch (error) {
            console.warn('Failed to check for updates:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const dismissAnnouncement = async () => {
        try {
            await axios.post('/api/releases/dismiss-announcement');
            setAnnouncement(null);
            setIsDismissed(true);
            localStorage.setItem('release_announcement_dismissed', 'true');
        } catch (error) {
            console.warn('Failed to dismiss announcement:', error);
            // Still dismiss locally
            setAnnouncement(null);
            setIsDismissed(true);
            localStorage.setItem('release_announcement_dismissed', 'true');
        }
    };

    return {
        announcement,
        isLoading,
        isDismissed,
        dismissAnnouncement,
        refetch: checkForUpdates
    };
}
```

### 2. Create Release Announcement Component

Create `resources/js/Components/ReleaseAnnouncement.jsx`:
```jsx
import { useState } from 'react';
import { X, ExternalLink, Download } from 'lucide-react';
import { 
    Announcement, 
    AnnouncementTag, 
    AnnouncementTitle 
} from './ui/kibo-ui/announcement';
import { Button } from './ui/button';
import { useReleaseAnnouncement } from '@/hooks/useReleaseAnnouncement';

export function ReleaseAnnouncement({ className = "" }) {
    const { announcement, dismissAnnouncement } = useReleaseAnnouncement();
    const [isVisible, setIsVisible] = useState(true);

    if (!announcement || !isVisible) {
        return null;
    }

    const handleDismiss = () => {
        setIsVisible(false);
        dismissAnnouncement();
    };

    const getChannelColor = (channel) => {
        switch (channel) {
            case 'alpha': return 'bg-red-100 text-red-800 border-red-200';
            case 'beta': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'live': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className={`w-full bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 ${className}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Download className="h-5 w-5 text-blue-600 flex-shrink-0" />
                        
                        <Announcement themed className="flex-1">
                            <AnnouncementTag 
                                className={getChannelColor(announcement.channel)}
                            >
                                {announcement.channel.toUpperCase()}
                            </AnnouncementTag>
                            
                            <AnnouncementTitle>
                                <span className="font-semibold">
                                    New {announcement.channel} release available: {announcement.version}
                                </span>
                                <span className="text-sm text-muted-foreground ml-2">
                                    (You're on {announcement.current_version})
                                </span>
                            </AnnouncementTitle>
                        </Announcement>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            asChild
                        >
                            <a 
                                href={announcement.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-1"
                            >
                                View Release
                                <ExternalLink className="h-3 w-3" />
                            </a>
                        </Button>
                        
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleDismiss}
                            className="h-8 w-8 p-0"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
```

### 3. Integrate into Main Layout

Update `resources/js/Layouts/AuthenticatedLayout.jsx`:
```jsx
import { ReleaseAnnouncement } from '@/Components/ReleaseAnnouncement';

export default function AuthenticatedLayout({ user, header, children }) {
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <ReleaseAnnouncement />
            
            {/* Rest of your layout */}
            <nav className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                {/* Navigation content */}
            </nav>

            {header && (
                <header className="bg-white dark:bg-gray-800 shadow">
                    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main>{children}</main>
        </div>
    );
}
```

## Configuration for Self-Hosters

### 1. Environment Setup Instructions

Provide these instructions for self-hosters in your installation documentation:

#### Required Environment Variables
```env
# Release Configuration
APP_VERSION=1.0.0                    # Current version of your installation
GITHUB_REPO=yourusername/kaiba       # Your GitHub repository  
RELEASE_CHANNEL=live                 # alpha, beta, or live
GITHUB_TOKEN=                        # Optional: GitHub personal access token

# Optional: Disable release checks entirely
DISABLE_RELEASE_CHECKS=false
```

#### GitHub Token Setup (Optional)
For higher API rate limits, users can create a GitHub Personal Access Token:

1. Go to GitHub → Settings → Developer settings → Personal access tokens
2. Generate a new token (classic)
3. No special permissions needed (public repo read access)
4. Add token to `.env` file as `GITHUB_TOKEN=your_token_here`

### 2. Configuration Options

Add configuration options to `config/app.php`:
```php
// Release announcement settings
'releases' => [
    'enabled' => env('DISABLE_RELEASE_CHECKS', false) === false,
    'version' => env('APP_VERSION', '1.0.0'),
    'github_repo' => env('GITHUB_REPO', ''),
    'release_channel' => env('RELEASE_CHANNEL', 'live'),
    'github_token' => env('GITHUB_TOKEN'),
    'cache_duration' => 3600, // 1 hour
    'check_frequency' => 86400, // 24 hours
],
```

### 3. Admin Panel Integration (Optional)

Create an admin settings page for release configuration:

```jsx
// AdminSettings.jsx
export function ReleaseSettings() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Release Announcements</h3>
                <p className="text-sm text-gray-500">
                    Configure how your installation checks for updates
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <div>
                    <label className="block text-sm font-medium">Current Version</label>
                    <input 
                        type="text" 
                        value="1.0.0" 
                        className="mt-1 block w-full rounded-md border-gray-300"
                        disabled
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium">Release Channel</label>
                    <select className="mt-1 block w-full rounded-md border-gray-300">
                        <option value="live">Live (Stable)</option>
                        <option value="beta">Beta (Release Candidate)</option>
                        <option value="alpha">Alpha (Experimental)</option>
                    </select>
                </div>

                <div>
                    <label className="flex items-center">
                        <input type="checkbox" className="rounded" />
                        <span className="ml-2 text-sm">Enable update notifications</span>
                    </label>
                </div>
            </div>
        </div>
    );
}
```

## Testing Your Setup

### 1. Test Release Creation

```bash
# Create a test release
git tag -a v1.0.1-alpha.1 -m "Test alpha release"
git push origin v1.0.1-alpha.1

# Create GitHub release
gh release create v1.0.1-alpha.1 \
  --title "Test Alpha v1.0.1-alpha.1" \
  --notes "Test release for announcement system" \
  --prerelease
```

### 2. Test API Endpoints

```bash
# Check for updates
curl -X GET "http://your-domain/api/releases/check-updates" \
  -H "Authorization: Bearer your-api-token"

# Dismiss announcement  
curl -X POST "http://your-domain/api/releases/dismiss-announcement" \
  -H "Authorization: Bearer your-api-token"
```

### 3. Frontend Testing

1. Set your current version lower than the test release
2. Refresh the application
3. Verify the announcement appears
4. Test dismissal functionality
5. Verify announcement doesn't reappear after dismissal

### 4. Channel Testing

Test each release channel:

```bash
# Test Alpha
APP_VERSION=1.0.0 RELEASE_CHANNEL=alpha php artisan tinker
>>> app(App\Services\ReleaseService::class)->getAnnouncementData()

# Test Beta
APP_VERSION=1.0.0 RELEASE_CHANNEL=beta php artisan tinker  
>>> app(App\Services\ReleaseService::class)->getAnnouncementData()

# Test Live
APP_VERSION=1.0.0 RELEASE_CHANNEL=live php artisan tinker
>>> app(App\Services\ReleaseService::class)->getAnnouncementData()
```

## Troubleshooting

### Common Issues

#### 1. API Rate Limiting
**Problem**: GitHub API returns 403 errors  
**Solution**: Add a GitHub Personal Access Token to `GITHUB_TOKEN`

#### 2. Announcements Not Showing
**Problem**: No announcements appear despite newer releases  
**Solutions**:
- Check `APP_VERSION` matches your actual version
- Verify `GITHUB_REPO` format: `username/repository`
- Check release channel matches available releases
- Clear Laravel cache: `php artisan cache:clear`

#### 3. Version Comparison Issues
**Problem**: Incorrect version comparisons  
**Solutions**:
- Ensure consistent version format (SemVer)
- Check for extra whitespace in version strings
- Verify tag format starts with `v` (e.g., `v1.0.0`)

#### 4. Announcement Persists After Dismissal
**Problem**: Dismissed announcements reappear  
**Solutions**:
- Check browser localStorage for dismissal state
- Verify API endpoint is accessible
- Check session storage on backend

### Debug Commands

```bash
# Check current configuration
php artisan tinker
>>> config('app.releases')

# Test release service
>>> app(App\Services\ReleaseService::class)->getLatestRelease()

# Check cache
>>> \Illuminate\Support\Facades\Cache::get('latest_release_live')

# Clear release cache
>>> \Illuminate\Support\Facades\Cache::forget('latest_release_live')
```

### Logging

Add logging to debug release checking:

```php
// In ReleaseService.php
Log::info('Checking for releases', [
    'current_version' => $this->currentVersion,
    'release_channel' => $this->releaseChannel,
    'repo' => $this->repo
]);

Log::info('Latest release found', ['release' => $latestRelease]);
```

View logs:
```bash
tail -f storage/logs/laravel.log | grep -i release
```

---

This setup provides a complete release announcement system that will help your self-hosted users stay informed about updates while giving you professional release management capabilities for your first public application.