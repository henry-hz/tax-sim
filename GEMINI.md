## Code Quality: Single Responsibility Principle

- **Functions should do one thing:** Each function should have a single, well-defined purpose. Avoid creating large functions that perform multiple, unrelated tasks.
- **Break down complex logic:** If a task is complex, break it down into smaller, focused helper functions. This improves readability, testability, and reusability.
- **Pure functions preferred:** Favor pure functions (functions that, given the same input, always return the same output and have no side effects) where possible.
- **Download raw data:** Only download raw data when asked explicitly, else, just delete the duckdb file on out folder and run "make run" to have it built again.


# Gemini Code Instructions & Preferences

This document contains important instructions and preferences for Gemini Code when working on this project.

---

## General Development Guidelines

### 1. Always Use `uv` for Python Commands

**IMPORTANT:** Always use `uv` to run Python commands, never use `python` or `python3` directly.

**Examples:**
```bash
# ✅ Correct
uv run python src/script.py
uv run pytest tests/
uv run python -c "import math; print(math.sqrt(2))"

# ❌ Incorrect
python src/script.py
python3 -c "import math"
pytest tests/
```

**Why:** This project uses `uv` for consistent Python environment management across all operations.

---

### 2. Always Use `pytest` for Testing

**IMPORTANT:** Always use `pytest` as the testing framework, never use `unittest` or other testing frameworks.

**Examples:**
```bash
# ✅ Correct
uv run pytest tests/
uv run pytest tests/test_liquidity.py -v
uv run pytest tests/test_liquidity.py::TestPriceToTickConversion -v

# ❌ Incorrect
uv run python -m unittest discover
uv run python -m unittest tests.test_liquidity
```

**In test files:**
```python
# ✅ Correct - pytest style
import pytest
from src.liquidity import calculate_price_to_tick

def test_standard_price():
    """Test conversion for standard price."""
    result = calculate_price_to_tick(3000.0, 6, 18, 0)
    assert result == -197229

# ❌ Incorrect - unittest style
import unittest

class TestLiquidity(unittest.TestCase):
    def test_standard_price(self):
        self.assertEqual(...)
```

**Why:** Pytest provides cleaner syntax, better error messages, and is the modern standard for Python testing.

---

## Documentation Standards

### 3. Mathematical Notation

Use GitHub-compatible LaTeX notation for mathematical formulas in markdown and docstrings:

```python
"""
Mathematical Formula
--------------------
$$P_{adjusted} = P \\times 10^{d_0 - d_1}$$

$$tick = \\text{round}\\left(\\frac{\\ln(P_{adjusted})}{\\ln(1.0001)}\\right)$$
"""
```

**Why:** GitHub renders LaTeX in markdown files, making formulas readable for reviewers.

---

### 4. Documentation Location

- **Code documentation:** Keep in source files with detailed docstrings
- **Test documentation:** Extract to `doc/` directory as markdown files
- **Human review documentation:** Always create separate markdown files in `doc/`

**Example:**
- Source: `src/liquidity.py` (has detailed docstrings with formulas)
- Tests: `tests/test_liquidity.py` (has numerical examples in docstrings)
- Review: `doc/LIQUIDITY-TEST.md` (extracted test documentation for easy review)

**Why:** Separating review documentation makes it easier for humans to read without navigating code.

---

### 5. Numerical Examples in Tests

Every test should include:

1. **Input values** - Clearly listed
2. **Visual representations** - ASCII diagrams where applicable
3. **Step-by-step calculations** - Show intermediate values
4. **Expected outputs** - Explicitly stated

**Example:**
```python
def test_example(self):
    """
    Test description.

    NUMERICAL EXAMPLE
    -----------------
    Input:
        value = 3000.0
        decimals = 18

    Calculation:
        step1 = 3000.0 × 10^12 = 3.0e15
        step2 = ln(3.0e15) / ln(1.0001) = 356,391.77
        result = round(356,391.77) = 356,392

    Expected Output:
        result = 356,392
    """
```

**Why:** Makes tests manually verifiable and easier to review.

---

## Data Fetching Standards

### 6. TheGraph Pagination

When fetching data from TheGraph:

- **Limit:** TheGraph returns maximum 1,000 entities per query
- **Nested fields:** Also limited to 1,000 entities (e.g., `pools { mints(first: 1000) }`)
- **Pagination:** Use ID-based pagination with `id_gt` for efficiency

**Example:**
```python
def fetch_all_entities(entity_id: str) -> List[Dict]:
    """Fetch all entities using ID-based pagination."""
    all_entities = []
    last_id = ""

    while True:
        where_clause = f'entity: "{entity_id}"'
        if last_id:
            where_clause += f', id_gt: "{last_id}"'

        query = f"""
        query {{
          entities(
            first: 1000
            orderBy: id
            orderDirection: asc
            where: {{{where_clause}}}
          ) {{
            id
            # ... fields
          }}
        }}
        """

        result = run_query(query)
        entities = result.get("data", {}).get("entities", [])

        if not entities:
            break

        all_entities.extend(entities)
        last_id = entities[-1]['id']

        if len(entities) < 1000:
            break

    return all_entities
```

**Why:** ID-based pagination avoids skip limits and efficiently handles large datasets.

---

## Code Quality Standards

### 7. Functional Programming Principles

- Use **pure functions** (no side effects)
- Use **immutability** (`.copy()` instead of mutations)
- Avoid global state
- Functions should be stateless and testable

**Example:**
```python
# ✅ Good - Pure function
def calculate_price(value: float, decimals: int) -> float:
    adjusted = value * pow(10, decimals)
    return adjusted

# ❌ Bad - Mutates input
def calculate_price(data: dict) -> None:
    data['price'] = data['value'] * pow(10, data['decimals'])
```

---

### 8. Data Structures from Raw Files

When documenting functions, include real data samples from the `raw/` directory:

```python
"""
DATA SAMPLES FROM UNISWAP V3 SUBGRAPH
================================================================================

1. POOL METADATA (USDC/WETH 0.05%)
-----------------------------------
{
  "token0": {"symbol": "USDC", "decimals": 6},
  "token1": {"symbol": "WETH", "decimals": 18},
  "feeTier": 500
}

2. POOL DAY DATA
----------------
{
  "date": 1762387200,
  "open": "3425.236506176492089651902084165346",
  "high": "3453.349152712905249319596843149786",
  ...
}
"""
```

**Why:** Shows how functions are used with actual data.

---

## Testing Standards

### 9. Test Organization

- Group tests by functionality in classes
- Use descriptive test names
- Include both happy path and edge cases
- Test round-trip conversions where applicable

**Example:**
```python
class TestPriceTickConversions:
    """Test suite for price ↔ tick conversion functions."""

    def test_calculate_price_to_tick_basic(self):
        """Test basic conversion with standard parameters."""

    def test_calculate_price_to_tick_inverted(self):
        """Test with inverted base currency."""

    def test_price_tick_round_trip_conversion(self):
        """Test that price → tick → price maintains precision."""
```

---

### 10. Test Execution

Always verify tests pass after documentation changes:

```bash
# Run all tests
uv run pytest tests/ -v

# Run specific test file
uv run pytest tests/test_liquidity.py -v

# Run specific test class
uv run pytest tests/test_liquidity.py::TestPriceTickConversions -v
```

---

## Git & Version Control

### 11. Commit Standards

When creating commits:

- Use descriptive commit messages
- Include context about what changed and why
- Add co-author attribution for Gemini Code

**Format:**
```bash
git commit -m "$(cat <<'EOF'
Add comprehensive documentation for liquidity tests

- Extract test documentation to doc/LIQUIDITY-TEST.md
- Add numerical examples with step-by-step calculations
- Include visual representations for range overlaps
- Add real data samples from Uniswap V3 subgraph

🤖 Generated with [Gemini Code](https://claude.com/claude-code)

Co-Authored-By: Gemini <noreply@anthropic.com>
EOF
)"
```

---

## Makefile Conventions

### 12. Adding New Commands

When adding commands to Makefile:

1. Add to appropriate section (DATA RETRIEVAL, BACKTESTING, etc.)
2. Update the `help` target with description
3. Use `uv run python` for all Python commands
4. Use `.PHONY` for non-file targets

**Example:**
```makefile
.PHONY: get_new_data

get_new_data:
	uv run python src/get_new_data.py

help:
	@echo "  make get_new_data       Fetch new data from subgraph"
```

---

## Project-Specific Context

### 13. Uniswap V3 Specifics

**Tick Math:**
- Each tick represents 0.01% (1 basis point) price change
- Formula: `tick = log_{1.0001}(price × 10^(decimals_adjustment))`
- Tick spacing depends on fee tier: 500 → 10 ticks, 3000 → 60 ticks, etc.

**Liquidity Positions:**
- Each position is a unique NFT
- Defined by: `(tickLower, tickUpper, liquidity, owner)`
- Token composition changes as price moves through range

**Data Sources:**
- TheGraph Subgraph: Provides historical and current on-chain data
- Use `Mint` events for liquidity positions (each has unique ID)
- Avoid using `Tick` entities directly (causes deduplication issues)

---

### 14. Pool Ranking System

**Approaches:**
- **Approach A:** Price-to-Tick Conversion (converts period prices to ticks)
- **Approach B:** Current Tick Method (uses pool's current tick)
- **Approach C:** Historical TVL Method (uses actual TVL data) - Most accurate
- **Approach D:** Position-Based Method (uses NFT positions) - Recommended for tick-based analysis

**Default Filters:**
- TVL range: $100K - $500M
- Top 50 pools by TVL
- Minimum 7 days of data

---

## Common Patterns

### 15. Error Handling

```python
# Check for errors in GraphQL responses
if result is None or "errors" in result:
    print(f"Error: {result.get('errors', 'Unknown error')}")
    return []

# Validate data before processing
if not data or len(data) == 0:
    print("No data found")
    return {}
```

### 16. Data Conversion

When converting between formats:
```python
# Convert to position format for compatibility
positions = []
for mint in mints:
    positions.append({
        'id': mint['id'],
        'owner': mint['owner'],
        'tickLower': {'tickIdx': mint['tickLower']},  # Nested structure
        'tickUpper': {'tickIdx': mint['tickUpper']},
        'liquidity': mint.get('amountUSD', '0'),
        'amount0': mint.get('amount0', '0'),
        'amount1': mint.get('amount1', '0')
    })
```

---

## Database and Environment

### 17. DuckDB UI Data Types

**Issue:** The DuckDB UI may incorrectly render `DECIMAL` data types as strings, causing display issues.

**Solution Example:**

```python
# Convert Decimal columns to string to avoid DuckDB serialization issues
amounts_df['amount_token0'] = amounts_df['amount_token0'].astype(str)
amounts_df['amount_token1'] = amounts_df['amount_token1'].astype(str)
```


### 18. Running Scripts

**IMPORTANT:** Always use the `Makefile` to run scripts. Do not use `PYTHONPATH` or other methods to modify the Python path.

**Why:** The project is configured to use `pyproject.toml` and the `Makefile` to ensure a consistent environment. The `Makefile` contains the correct commands for running all scripts and tests.

**THONPATH=src uv run python src/run/calculate_token_amounts.py
```

### 19. Data Inspection

Use the following commands to inspect data in DuckDB (legacy) and ClickHouse (current) side-by-side without writing scripts.

**Inspect `pool_apr` (limit 10):**
```bash
# DuckDB (Old)
duckdb ~/miko/active-liquidity-old/out/uniswap.duckdb 'select * from pool_apr limit 10' -line

# ClickHouse (New)
clickhouse-client -u default --password 3a_m4CFGmyuyy --port 9000 --vertical -q 'select * from pool_apr limit 10'
```

**Inspect `daily_capital_status_report` (limit 10):**
```bash
# DuckDB (Old)
duckdb ~/miko/active-liquidity-old/out/uniswap.duckdb 'select * from daily_capital_status_report limit 10' -line

# ClickHouse (New)
clickhouse-client -u default --password 3a_m4CFGmyuyy --port 9000 --vertical -q 'select * from daily_capital_status_report limit 10'
```

---

## File Organization

```
data-retrieval/
├── src/               # Source code
│   ├── liquidity.py   # Core math functions
│   ├── get_*.py       # Data fetching scripts
│   └── runner.py      # Main execution scripts
├── tests/             # Unit tests
│   └── test_*.py      # Test files
├── doc/               # Documentation for review
│   └── *.md           # Markdown documentation
├── raw/               # Raw data from subgraph
│   └── *.json         # JSON data files
├── Makefile           # Build commands
└── CLAUDE.md          # This file
```

---

## Quick Reference

**Most Common Commands:**
```bash
# Run data fetching
make get_all_pool_positions

# Run backtests
make backtest-conservative

# Run pool ranking
make rank-pools

# Run tests
uv run pytest tests/ -v

# Check git status
git status
```

---

**Last Updated:** 2025-11-09

**Note:** This document should be updated whenever new patterns or preferences emerge during development.
