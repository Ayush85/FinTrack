import {useState, useEffect, useCallback} from 'react';
import {Transaction, DateFilter, TypeFilter} from '../types';
import {isDateInFilterRange} from '../utils';

interface UseFilterProps {
  transactions: Transaction[];
}

export const useFilters = ({transactions}: UseFilterProps) => {
  const [dateFilter, setDateFilter] = useState<DateFilter>('All');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('All');
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);

  const applyFilters = useCallback(() => {
    const filtered = transactions.filter(txn => {
      const dateCondition = isDateInFilterRange(txn.date, dateFilter);

      let typeCondition = true;
      if (typeFilter === 'Debit') {
        typeCondition = txn.type === 'Debit';
      }
      if (typeFilter === 'Credit') {
        typeCondition = txn.type === 'Credit';
      }

      return dateCondition && typeCondition;
    });

    setFilteredTransactions(filtered);
  }, [transactions, dateFilter, typeFilter]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  return {
    dateFilter,
    typeFilter,
    filteredTransactions,
    setDateFilter,
    setTypeFilter,
  };
};

