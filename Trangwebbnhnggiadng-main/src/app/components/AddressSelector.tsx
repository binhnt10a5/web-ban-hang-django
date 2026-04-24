import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { vietnamProvinces } from '../data/vietnam-location';
import type { Province, District, Ward } from '../data/vietnam-location';

interface AddressSelectorProps {
  value: {
    province: string;
    district: string;
    ward: string;
    street: string;
  };
  onChange: (address: {
    province: string;
    district: string;
    ward: string;
    street: string;
  }) => void;
  errors?: {
    province?: string;
    district?: string;
    ward?: string;
    street?: string;
  };
}

export function AddressSelector({ value, onChange, errors }: AddressSelectorProps) {
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  // Load province on mount
  useEffect(() => {
    if (value.province) {
      const province = vietnamProvinces.find(p => p.name === value.province);
      if (province) {
        setSelectedProvince(province);
        setDistricts(province.districts);
      }
    }
  }, []);

  // Load district when province changes
  useEffect(() => {
    if (selectedProvince && value.district) {
      const district = selectedProvince.districts.find(d => d.name === value.district);
      if (district) {
        setSelectedDistrict(district);
        setWards(district.wards);
      }
    }
  }, [selectedProvince]);

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provinceName = e.target.value;
    const province = vietnamProvinces.find(p => p.name === provinceName);
    
    setSelectedProvince(province || null);
    setSelectedDistrict(null);
    setDistricts(province?.districts || []);
    setWards([]);
    
    onChange({
      province: provinceName,
      district: '',
      ward: '',
      street: value.street,
    });
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const districtName = e.target.value;
    const district = districts.find(d => d.name === districtName);
    
    setSelectedDistrict(district || null);
    setWards(district?.wards || []);
    
    onChange({
      province: value.province,
      district: districtName,
      ward: '',
      street: value.street,
    });
  };

  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({
      province: value.province,
      district: value.district,
      ward: e.target.value,
      street: value.street,
    });
  };

  const handleStreetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      province: value.province,
      district: value.district,
      ward: value.ward,
      street: e.target.value,
    });
  };

  return (
    <div className="space-y-4">
      {/* Số nhà, tên đường */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Số nhà, tên đường <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={value.street}
          onChange={handleStreetChange}
          placeholder="Ví dụ: 123 Nguyễn Văn A"
          className={`w-full px-4 py-3 bg-[#2a2a2a] border ${
            errors?.street ? 'border-red-500' : 'border-gray-700'
          } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500`}
        />
        {errors?.street && (
          <p className="text-red-500 text-sm mt-1">{errors.street}</p>
        )}
      </div>

      {/* Tỉnh/Thành phố */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Tỉnh/Thành phố <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <select
            value={value.province}
            onChange={handleProvinceChange}
            className={`w-full px-4 py-3 bg-[#2a2a2a] border ${
              errors?.province ? 'border-red-500' : 'border-gray-700'
            } rounded-lg text-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer`}
          >
            <option value="" className="bg-[#2a2a2a]">-- Chọn Tỉnh/Thành phố --</option>
            {vietnamProvinces.map((province) => (
              <option key={province.code} value={province.name} className="bg-[#2a2a2a]">
                {province.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>
        {errors?.province && (
          <p className="text-red-500 text-sm mt-1">{errors.province}</p>
        )}
      </div>

      {/* Quận/Huyện */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Quận/Huyện <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <select
            value={value.district}
            onChange={handleDistrictChange}
            disabled={!selectedProvince}
            className={`w-full px-4 py-3 bg-[#2a2a2a] border ${
              errors?.district ? 'border-red-500' : 'border-gray-700'
            } rounded-lg text-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <option value="" className="bg-[#2a2a2a]">-- Chọn Quận/Huyện --</option>
            {districts.map((district) => (
              <option key={district.code} value={district.name} className="bg-[#2a2a2a]">
                {district.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>
        {errors?.district && (
          <p className="text-red-500 text-sm mt-1">{errors.district}</p>
        )}
      </div>

      {/* Phường/Xã */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Phường/Xã <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <select
            value={value.ward}
            onChange={handleWardChange}
            disabled={!selectedDistrict}
            className={`w-full px-4 py-3 bg-[#2a2a2a] border ${
              errors?.ward ? 'border-red-500' : 'border-gray-700'
            } rounded-lg text-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <option value="" className="bg-[#2a2a2a]">-- Chọn Phường/Xã --</option>
            {wards.map((ward) => (
              <option key={ward.code} value={ward.name} className="bg-[#2a2a2a]">
                {ward.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>
        {errors?.ward && (
          <p className="text-red-500 text-sm mt-1">{errors.ward}</p>
        )}
      </div>
    </div>
  );
}

// Helper function to format full address
export function formatFullAddress(address: {
  province: string;
  district: string;
  ward: string;
  street: string;
}): string {
  const parts = [address.street, address.ward, address.district, address.province].filter(Boolean);
  return parts.join(', ');
}
