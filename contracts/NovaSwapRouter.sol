// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20 {
    function transfer(
        address to,
        uint256 amount
    ) external returns (bool);

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);

    function balanceOf(
        address account
    ) external view returns (uint256);

    function decimals()
        external
        view
        returns (uint8);
}

contract NovaSwapRouter {
    address public owner;

    address public constant NATIVE_TOKEN =
        address(0);

    mapping(address => mapping(address => uint256))
        public rates;

    event RateUpdated(
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 rate
    );

    event LiquidityDeposited(
        address indexed token,
        uint256 amount
    );

    event NativeLiquidityDeposited(
        uint256 amount
    );

    event Swap(
        address indexed user,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut
    );

    modifier onlyOwner() {
        require(
            msg.sender == owner,
            "Not owner"
        );
        _;
    }

    modifier validDeadline(
        uint256 deadline
    ) {
        require(
            block.timestamp <= deadline,
            "Transaction expired"
        );
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    receive() external payable {
        emit NativeLiquidityDeposited(
            msg.value
        );
    }

    function setRate(
        address tokenIn,
        address tokenOut,
        uint256 rate
    ) external onlyOwner {
        require(
            rate > 0,
            "Invalid rate"
        );

        rates[tokenIn][tokenOut] = rate;

        emit RateUpdated(
            tokenIn,
            tokenOut,
            rate
        );
    }

    function depositToken(
        address token,
        uint256 amount
    ) external onlyOwner {
        require(
            token != NATIVE_TOKEN,
            "Use ETH deposit"
        );

        require(
            IERC20(token).transferFrom(
                msg.sender,
                address(this),
                amount
            ),
            "Token transfer failed"
        );

        emit LiquidityDeposited(
            token,
            amount
        );
    }

    function depositETH()
        external
        payable
        onlyOwner
    {
        require(
            msg.value > 0,
            "No ETH sent"
        );

        emit NativeLiquidityDeposited(
            msg.value
        );
    }

    function getTokenDecimals(
        address token
    ) internal view returns (uint8) {
        if (token == NATIVE_TOKEN) {
            return 18;
        }

        return IERC20(token).decimals();
    }

    function getAmountOut(
        uint256 amountIn,
        address tokenIn,
        address tokenOut
    )
        public
        view
        returns (uint256)
    {
        require(
            amountIn > 0,
            "Invalid amount"
        );

        uint256 rate =
            rates[tokenIn][tokenOut];

        require(
            rate > 0,
            "Pair not supported"
        );

        uint8 decimalsIn =
            getTokenDecimals(tokenIn);

        uint8 decimalsOut =
            getTokenDecimals(tokenOut);

        return
            (
                amountIn *
                rate *
                (10 ** decimalsOut)
            ) /
            (
                1e18 *
                (10 ** decimalsIn)
            );
    }

    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    )
        external
        validDeadline(deadline)
        returns (uint256[] memory amounts)
    {
        require(
            path.length >= 2,
            "Invalid path"
        );

        address tokenIn = path[0];
        address tokenOut =
            path[path.length - 1];

        require(
            tokenIn != NATIVE_TOKEN &&
            tokenOut != NATIVE_TOKEN,
            "Invalid token path"
        );

        uint256 amountOut =
            getAmountOut(
                amountIn,
                tokenIn,
                tokenOut
            );

        require(
            amountOut >= amountOutMin,
            "Slippage exceeded"
        );

        require(
            IERC20(tokenOut).balanceOf(
                address(this)
            ) >= amountOut,
            "Insufficient liquidity"
        );

        require(
            IERC20(tokenIn).transferFrom(
                msg.sender,
                address(this),
                amountIn
            ),
            "Input transfer failed"
        );

        require(
            IERC20(tokenOut).transfer(
                to,
                amountOut
            ),
            "Output transfer failed"
        );

        amounts = new uint256[](2);

        amounts[0] = amountIn;
        amounts[1] = amountOut;

        emit Swap(
            msg.sender,
            tokenIn,
            tokenOut,
            amountIn,
            amountOut
        );
    }

    function swapExactETHForTokens(
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    )
        external
        payable
        validDeadline(deadline)
        returns (uint256[] memory amounts)
    {
        require(
            path.length >= 2,
            "Invalid path"
        );

        require(
            path[0] == NATIVE_TOKEN,
            "Invalid ETH path"
        );

        address tokenOut =
            path[path.length - 1];

        uint256 amountOut =
            getAmountOut(
                msg.value,
                NATIVE_TOKEN,
                tokenOut
            );

        require(
            amountOut >= amountOutMin,
            "Slippage exceeded"
        );

        require(
            IERC20(tokenOut).balanceOf(
                address(this)
            ) >= amountOut,
            "Insufficient liquidity"
        );

        require(
            IERC20(tokenOut).transfer(
                to,
                amountOut
            ),
            "Output transfer failed"
        );

        amounts = new uint256[](2);

        amounts[0] = msg.value;
        amounts[1] = amountOut;

        emit Swap(
            msg.sender,
            NATIVE_TOKEN,
            tokenOut,
            msg.value,
            amountOut
        );
    }

    function swapExactTokensForETH(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    )
        external
        validDeadline(deadline)
        returns (uint256[] memory amounts)
    {
        require(
            path.length >= 2,
            "Invalid path"
        );

        require(
            path[path.length - 1] ==
                NATIVE_TOKEN,
            "Invalid ETH path"
        );

        address tokenIn = path[0];

        uint256 amountOut =
            getAmountOut(
                amountIn,
                tokenIn,
                NATIVE_TOKEN
            );

        require(
            amountOut >= amountOutMin,
            "Slippage exceeded"
        );

        require(
            address(this).balance >=
                amountOut,
            "Insufficient ETH liquidity"
        );

        require(
            IERC20(tokenIn).transferFrom(
                msg.sender,
                address(this),
                amountIn
            ),
            "Input transfer failed"
        );

        (bool success, ) =
            payable(to).call{
                value: amountOut
            }("");

        require(
            success,
            "ETH transfer failed"
        );

        amounts = new uint256[](2);

        amounts[0] = amountIn;
        amounts[1] = amountOut;

        emit Swap(
            msg.sender,
            tokenIn,
            NATIVE_TOKEN,
            amountIn,
            amountOut
        );
    }

    function withdrawToken(
        address token,
        uint256 amount
    ) external onlyOwner {
        require(
            IERC20(token).transfer(
                owner,
                amount
            ),
            "Transfer failed"
        );
    }

    function withdrawETH(
        uint256 amount
    ) external onlyOwner {
        require(
            address(this).balance >=
                amount,
            "Insufficient balance"
        );

        (bool success, ) =
            payable(owner).call{
                value: amount
            }("");

        require(
            success,
            "ETH transfer failed"
        );
    }

    function transferOwnership(
        address newOwner
    ) external onlyOwner {
        require(
            newOwner != address(0),
            "Invalid owner"
        );

        owner = newOwner;
    }
}