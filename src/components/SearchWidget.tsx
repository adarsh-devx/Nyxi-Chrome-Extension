import React, { useState } from 'react';
import { Search, Globe } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

const engineData = {
  google: {
    name: 'Google',
    url: 'https://www.google.com/search?q=',
    placeholder: 'Search Google...',
  },
  duckduckgo: {
    name: 'DuckDuckGo',
    url: 'https://duckduckgo.com/?q=',
    placeholder: 'Search DuckDuckGo...',
  },
  bing: {
    name: 'Bing',
    url: 'https://www.bing.com/search?q=',
    placeholder: 'Search Bing...',
  },
  brave: {
    name: 'Brave',
    url: 'https://search.brave.com/search?q=',
    placeholder: 'Search Brave...',
  },
  custom: {
    name: 'Custom Search',
    url: '',
    placeholder: 'Search Custom Engine...',
  },
};

export const SearchWidget: React.FC = () => {
  const { settings } = useSettings();
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const activeEngineKey = settings.searchEngine;
  const activeEngine = engineData[activeEngineKey];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    let targetUrl = '';
    if (activeEngineKey === 'custom') {
      const customUrl = settings.customSearchUrl || 'https://www.google.com/search?q=%s';
      if (customUrl.includes('%s')) {
        targetUrl = customUrl.replace('%s', encodeURIComponent(query));
      } else {
        targetUrl = customUrl + encodeURIComponent(query);
      }
    } else {
      targetUrl = activeEngine.url + encodeURIComponent(query);
    }

    window.location.href = targetUrl;
  };

  if (!settings.widgetVisibility.search) return null;

  return (
    <div className="w-full max-w-xl mx-auto drop-shadow-lg">
      <form
        onSubmit={handleSearch}
        className={`search-bar ${isFocused ? 'search-bar-focused' : ''}`}
      >
        {activeEngineKey === 'custom' ? (
          <Globe className="w-5 h-5 text-white-55 transition-colors duration-300" />
        ) : (
          <Search className="w-5 h-5 text-white-55 transition-colors duration-300" />
        )}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={activeEngine.placeholder}
          className="flex-1 bg-transparent border-none outline-none text-white text-base placeholder-white/45 w-full"
          autoFocus
        />
        <button
          type="submit"
          className="text-white-55 hover-text-white transition-colors duration-300 focus:outline-none"
          aria-label="Search"
        >
          <Search className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
