import React, { useState } from 'react';
import { Slider, SlidersHorizontal, Package, DollarSign, Palette, Box } from 'lucide-react';
import { Slider as SliderUI } from './ui/slider';

interface FilterSidebarProps {
  onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
  category: string[];
  priceRange: [number, number];
  brand: string[];
}

const categories = [
  { id: 'air-purifier', name: 'Máy lọc không khí' },
  { id: 'coffee-maker', name: 'Máy pha cà phê' },
  { id: 'refrigerator', name: 'Tủ lạnh' },
  { id: 'vacuum', name: 'Máy hút bụi' },
  { id: 'washing-machine', name: 'Máy giặt' },
  { id: 'microwave', name: 'Lò vi sóng' },
];

const brands = [
  'Zen',
  'Folort',
  'Homely',
  'SmartClean',
  'UltraWash',
  'QuickHeat',
  'AirFlow',
];

export function FilterSidebar({ onFilterChange }: FilterSidebarProps) {
  const [filters, setFilters] = useState<FilterState>({
    category: [],
    priceRange: [0, 50000000],
    brand: [],
  });

  const handleCategoryChange = (categoryId: string) => {
    const newCategories = filters.category.includes(categoryId)
      ? filters.category.filter((c) => c !== categoryId)
      : [...filters.category, categoryId];
    
    const newFilters = { ...filters, category: newCategories };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleBrandChange = (brand: string) => {
    const newBrands = filters.brand.includes(brand)
      ? filters.brand.filter((b) => b !== brand)
      : [...filters.brand, brand];
    
    const newFilters = { ...filters, brand: newBrands };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handlePriceChange = (value: number[]) => {
    const newFilters = { ...filters, priceRange: [value[0], value[1]] as [number, number] };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <aside className="w-64 bg-[#2a2a2a] rounded-2xl p-6 border border-gray-700 h-fit sticky top-24">
      {/* Category Filter */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Package className="w-5 h-5 text-gray-400" />
          <h3 className="text-white font-semibold">Danh mục</h3>
        </div>
        <div className="space-y-2">
          {categories.map((category) => (
            <label key={category.id} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.category.includes(category.id)}
                onChange={() => handleCategoryChange(category.id)}
                className="w-4 h-4 rounded border-gray-600 bg-[#3a3a3a] text-[#8B7355] focus:ring-[#8B7355]"
              />
              <span className="text-gray-300 text-sm group-hover:text-white transition">
                {category.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="mb-6 pb-6 border-b border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 text-gray-400" />
          <h3 className="text-white font-semibold">Khoảng giá</h3>
        </div>
        <div className="px-2">
          <SliderUI
            value={[filters.priceRange[0], filters.priceRange[1]]}
            min={0}
            max={50000000}
            step={1000000}
            onValueChange={handlePriceChange}
            className="mb-4"
          />
          <div className="flex justify-between text-sm text-gray-400">
            <span>{(filters.priceRange[0] / 1000000).toFixed(0)}tr</span>
            <span>{(filters.priceRange[1] / 1000000).toFixed(0)}tr</span>
          </div>
        </div>
      </div>

      {/* Brand Filter */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Box className="w-5 h-5 text-gray-400" />
          <h3 className="text-white font-semibold">Thương hiệu</h3>
        </div>
        <div className="space-y-2">
          {brands.map((brand) => (
            <label key={brand} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.brand.includes(brand)}
                onChange={() => handleBrandChange(brand)}
                className="w-4 h-4 rounded border-gray-600 bg-[#3a3a3a] text-[#8B7355] focus:ring-[#8B7355]"
              />
              <span className="text-gray-300 text-sm group-hover:text-white transition">
                {brand}
              </span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
}
