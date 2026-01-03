/**
 * 결제 관련 API
 */

import { mockDelay, mockError, generateId } from './client';
import { getCurrentUser, mockTransactions, type Transaction } from '@/mocks/data';

export interface ChargeResult {
  transactionId: string;
  amount: number;
  newBalance: number;
  method: 'card' | 'transfer';
}

export interface PaymentResult {
  transactionId: string;
  requestId: string;
  amount: number;
  method: 'cash' | 'point' | 'hybrid';
  cashUsed: number;
  pointUsed: number;
  status: 'completed' | 'failed';
}

export interface WithdrawResult {
  withdrawalId: string;
  amount: number;
  fee: number;
  netAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  expectedDate: string;
}

// Mock 잔액 저장소
let balanceStore = {
  cash: getCurrentUser().cashBalance,
  point: getCurrentUser().pointBalance,
};

// Mock 거래 내역 저장소
const transactionsStore: Transaction[] = [...mockTransactions];

export const paymentApi = {
  /**
   * 현재 잔액 조회
   */
  getBalance: async (): Promise<{ cash: number; point: number }> => {
    console.log('[Mock API] 잔액 조회');
    return mockDelay({ ...balanceStore });
  },

  /**
   * 잔액 충전
   */
  chargeBalance: async (
    amount: number,
    method: 'card' | 'transfer'
  ): Promise<ChargeResult> => {
    console.log('[Mock API] 잔액 충전:', amount, method);

    if (amount < 1000) {
      return mockError('최소 충전 금액은 1,000원입니다');
    }

    if (amount > 1000000) {
      return mockError('최대 충전 금액은 1,000,000원입니다');
    }

    // 잔액 업데이트
    balanceStore.cash += amount;

    // 거래 내역 추가
    const transaction: Transaction = {
      id: generateId('txn'),
      userId: getCurrentUser().id,
      type: 'charge',
      amount: amount,
      balance: balanceStore.cash,
      description: method === 'card' ? '카드 충전' : '계좌이체 충전',
      createdAt: new Date().toISOString(),
    };
    transactionsStore.unshift(transaction);

    return mockDelay(
      {
        transactionId: transaction.id,
        amount,
        newBalance: balanceStore.cash,
        method,
      },
      1000
    );
  },

  /**
   * 서비스 결제
   */
  processPayment: async (
    requestId: string,
    amount: number,
    method: 'cash' | 'point' | 'hybrid',
    pointAmount?: number
  ): Promise<PaymentResult> => {
    console.log('[Mock API] 결제 처리:', requestId, amount, method);

    let cashUsed = 0;
    let pointUsed = 0;

    switch (method) {
      case 'cash':
        if (balanceStore.cash < amount) {
          return mockError('잔액이 부족합니다');
        }
        cashUsed = amount;
        break;
      case 'point':
        // 1 포인트 = 1000원
        const requiredPoints = amount / 1000;
        if (balanceStore.point < requiredPoints) {
          return mockError('포인트가 부족합니다');
        }
        pointUsed = requiredPoints;
        break;
      case 'hybrid':
        // 포인트 먼저 사용, 나머지 현금
        pointUsed = pointAmount || 0;
        cashUsed = amount - pointUsed * 1000;
        if (balanceStore.cash < cashUsed || balanceStore.point < pointUsed) {
          return mockError('잔액이 부족합니다');
        }
        break;
    }

    // 잔액 차감
    balanceStore.cash -= cashUsed;
    balanceStore.point -= pointUsed;

    // 거래 내역 추가
    const transaction: Transaction = {
      id: generateId('pay'),
      userId: getCurrentUser().id,
      type: 'payment',
      amount: -amount,
      balance: balanceStore.cash,
      description: '서비스 결제',
      requestId,
      createdAt: new Date().toISOString(),
    };
    transactionsStore.unshift(transaction);

    return mockDelay(
      {
        transactionId: transaction.id,
        requestId,
        amount,
        method,
        cashUsed,
        pointUsed,
        status: 'completed',
      },
      1500
    );
  },

  /**
   * 거래 내역 조회
   */
  getTransactions: async (
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ transactions: Transaction[]; total: number; hasMore: boolean }> => {
    console.log('[Mock API] 거래 내역 조회:', userId, page, limit);

    const userTransactions = transactionsStore.filter(t => t.userId === userId);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const items = userTransactions.slice(startIndex, endIndex);

    return mockDelay({
      transactions: items,
      total: userTransactions.length,
      hasMore: endIndex < userTransactions.length,
    });
  },

  /**
   * 출금 요청 (제공자용)
   */
  requestWithdrawal: async (
    amount: number,
    bankInfo: {
      bankName: string;
      accountNumber: string;
      accountHolder: string;
    }
  ): Promise<WithdrawResult> => {
    console.log('[Mock API] 출금 요청:', amount, bankInfo);

    if (amount < 10000) {
      return mockError('최소 출금 금액은 10,000원입니다');
    }

    if (balanceStore.cash < amount) {
      return mockError('출금 가능 금액이 부족합니다');
    }

    const fee = Math.floor(amount * 0.033); // 3.3% 수수료
    const netAmount = amount - fee;

    // 잔액 차감
    balanceStore.cash -= amount;

    // 거래 내역 추가
    const transaction: Transaction = {
      id: generateId('wdr'),
      userId: getCurrentUser().id,
      type: 'withdraw',
      amount: -amount,
      balance: balanceStore.cash,
      description: `출금 (${bankInfo.bankName} ${bankInfo.accountNumber.slice(-4)})`,
      createdAt: new Date().toISOString(),
    };
    transactionsStore.unshift(transaction);

    // 3영업일 후 예상
    const expectedDate = new Date();
    expectedDate.setDate(expectedDate.getDate() + 3);

    return mockDelay(
      {
        withdrawalId: transaction.id,
        amount,
        fee,
        netAmount,
        status: 'pending',
        expectedDate: expectedDate.toISOString(),
      },
      1000
    );
  },

  /**
   * 환불 처리
   */
  processRefund: async (
    requestId: string,
    amount: number
  ): Promise<{ success: boolean; refundedAmount: number }> => {
    console.log('[Mock API] 환불 처리:', requestId, amount);

    // 잔액 복구
    balanceStore.cash += amount;

    // 거래 내역 추가
    const transaction: Transaction = {
      id: generateId('ref'),
      userId: getCurrentUser().id,
      type: 'charge', // 환불은 충전과 같은 효과
      amount: amount,
      balance: balanceStore.cash,
      description: '서비스 환불',
      requestId,
      createdAt: new Date().toISOString(),
    };
    transactionsStore.unshift(transaction);

    return mockDelay({ success: true, refundedAmount: amount });
  },

  /**
   * 수익 수령 (제공자용 - 서비스 완료 시)
   */
  receiveEarnings: async (
    requestId: string,
    amount: number
  ): Promise<{ success: boolean; receivedAmount: number; newBalance: number }> => {
    console.log('[Mock API] 수익 수령:', requestId, amount);

    // 플랫폼 수수료 10%
    const platformFee = Math.floor(amount * 0.1);
    const receivedAmount = amount - platformFee;

    balanceStore.cash += receivedAmount;

    // 거래 내역 추가
    const transaction: Transaction = {
      id: generateId('rcv'),
      userId: getCurrentUser().id,
      type: 'receive',
      amount: receivedAmount,
      balance: balanceStore.cash,
      description: '서비스 수익',
      requestId,
      createdAt: new Date().toISOString(),
    };
    transactionsStore.unshift(transaction);

    return mockDelay({
      success: true,
      receivedAmount,
      newBalance: balanceStore.cash,
    });
  },
};
