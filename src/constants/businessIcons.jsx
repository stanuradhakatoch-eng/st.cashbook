import { 
  FaLeaf, FaHardHat, FaGraduationCap, FaLaptop, FaMoneyBillWave, 
  FaUtensils, FaTshirt, FaTools, FaGem, FaMedkit, FaShoppingBasket, 
  FaTruck, FaThLarge, FaStore, FaBoxes, FaIndustry, FaUserCog, FaExchangeAlt 
} from 'react-icons/fa';

export const CATEGORIES = [
  'Agriculture', 'Construction', 'Education', 'Electronics',
  'Financial Services', 'Food/Restaurant', 'Clothes/Fashion', 'Hardware',
  'Jewellery', 'Healthcare & Fitness', 'Kirana/Grocery', 'Transport', 'Other',
];

export const BUSINESS_TYPES = [
  'Retailer', 'Distributor', 'Manufacturer', 'Service Provider', 'Trader', 'Other'
];

export const CATEGORY_ICONS = {
  'Agriculture': <FaLeaf size={18} color="#10B981" />,
  'Construction': <FaHardHat size={18} color="#F59E0B" />,
  'Education': <FaGraduationCap size={18} color="#3B82F6" />,
  'Electronics': <FaLaptop size={18} color="#8B5CF6" />,
  'Financial Services': <FaMoneyBillWave size={18} color="#10B981" />,
  'Food/Restaurant': <FaUtensils size={18} color="#F59E0B" />,
  'Clothes/Fashion': <FaTshirt size={18} color="#EC4899" />,
  'Hardware': <FaTools size={18} color="#EF4444" />,
  'Jewellery': <FaGem size={18} color="#8B5CF6" />,
  'Healthcare & Fitness': <FaMedkit size={18} color="#10B981" />,
  'Kirana/Grocery': <FaShoppingBasket size={18} color="#10B981" />,
  'Transport': <FaTruck size={18} color="#3B82F6" />,
  'Other': <FaThLarge size={18} color="#6B7280" />
};

export const TYPE_ICONS = {
  'Retailer': <FaStore size={18} color="#3B82F6" />,
  'Distributor': <FaBoxes size={18} color="#F59E0B" />,
  'Manufacturer': <FaIndustry size={18} color="#10B981" />,
  'Service Provider': <FaUserCog size={18} color="#8B5CF6" />,
  'Trader': <FaExchangeAlt size={18} color="#10B981" />,
  'Other': <FaThLarge size={18} color="#6B7280" />
};
