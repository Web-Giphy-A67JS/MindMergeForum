import PropTypes from 'prop-types';
import { Box, Select, Input, HStack, FormControl, FormLabel } from '@chakra-ui/react';
import { SORT_LABELS, DATE_RANGE } from '../../common/constants/sorting.constants';

export const SortingControls = ({
  sortCriteria,
  onSortCriteriaChange,
  dateRange,
  onDateRangeChange,
  searchQuery,
  onSearchChange
}) => {
  const today = new Date().toISOString().split('T')[0];

  return (
    <Box>
      <HStack spacing={4} align="flex-end">
      <FormControl>
          <FormLabel htmlFor="search">Search:</FormLabel>
          <Input
            id="search"
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </FormControl>
        <FormControl>
          <FormLabel htmlFor="sort-criteria">Sort by:</FormLabel>
          <Select
            id="sort-criteria"
            value={sortCriteria}
            onChange={(e) => onSortCriteriaChange(e.target.value)}
          >
            {Object.entries(SORT_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </Select>
        </FormControl>
        
        <FormControl>
          <FormLabel htmlFor="date-from">From:</FormLabel>
          <Input
            type="date"
            id="date-from"
            name={DATE_RANGE.FROM}
            value={dateRange[DATE_RANGE.FROM]}
            onChange={(e) => onDateRangeChange({ ...dateRange, [DATE_RANGE.FROM]: e.target.value })}
          />
        </FormControl>

        <FormControl>
          <FormLabel htmlFor="date-to">To:</FormLabel>
          <Input
            type="date"
            id="date-to"
            name={DATE_RANGE.TO}
            value={dateRange[DATE_RANGE.TO] || today}
            max={today}
            onChange={(e) => onDateRangeChange({ ...dateRange, [DATE_RANGE.TO]: e.target.value })}
          />
        </FormControl>
      </HStack>
    </Box>
  );
};

SortingControls.propTypes = {
  sortCriteria: PropTypes.string.isRequired,
  onSortCriteriaChange: PropTypes.func.isRequired,
  dateRange: PropTypes.shape({
    [DATE_RANGE.FROM]: PropTypes.string,
    [DATE_RANGE.TO]: PropTypes.string
  }).isRequired,
  onDateRangeChange: PropTypes.func.isRequired,
  searchQuery: PropTypes.string,
  onSearchChange: PropTypes.func.isRequired
};