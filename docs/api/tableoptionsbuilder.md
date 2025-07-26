---
title: TableOptionsBuilder
---

# TableOptionsBuilder








## TableOptionsBuilder


Fluent builder for table-level options (Cassandra/ScyllaDB).
Chain methods to configure compaction, compression, caching, and more.





## compaction


Set compaction strategy and options.


### Parameters

| Name | Description |
|------|-------------|
| `strategy` | Fully qualified compaction class name. |
| `options` | Additional compaction parameters. |





## compression




### Parameters

| Name | Description |
|------|-------------|
| `options` | Compression map. |

### Example

```typescript
{
  class: 'LZ4Compressor'
}
```




## gcGraceSeconds


Set GC grace seconds.


### Parameters

| Name | Description |
|------|-------------|
| `seconds` | Number of seconds before tombstones are dropped. |





## caching


Configure caching options.


### Parameters

| Name | Description |
|------|-------------|
| `keys` | &#x27;ALL&#x27; or &#x27;NONE&#x27;. |
| `rows` | &#x27;ALL&#x27;, &#x27;NONE&#x27;, or a fractional string (e.g., &#x27;0.01&#x27;). |





## defaultTTL


Set default TTL for the table.


### Parameters

| Name | Description |
|------|-------------|
| `seconds` | Time-to-live in seconds. |





## speculativeRetry


Set speculative retry policy.


### Parameters

| Name | Description |
|------|-------------|
| `value` | Retry policy (e.g., &#x27;NONE&#x27;, &#x27;ALWAYS&#x27;, &#x27;NUM_N&#x27;, &#x27;CUSTOM&#x27;). |





## comment


Add a comment to the table.


### Parameters

| Name | Description |
|------|-------------|
| `text` | Comment text. |





## addCustomOption


Add a custom option not covered by built-ins.


### Parameters

| Name | Description |
|------|-------------|
| `key` | Option key. |
| `value` | Option value. |





## build


Build and return the configured TableOptions object.





