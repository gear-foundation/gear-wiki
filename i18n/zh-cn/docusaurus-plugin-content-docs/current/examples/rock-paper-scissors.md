---
sidebar_label: 猜拳游戏
sidebar_position: 19
---

# 猜拳游戏

## 介绍

石头剪子布是一种起源于中国的游戏，通常在两个人之间玩，每个玩家同时用伸出的手形成三种形状之一。这些形状是 "石头"（紧闭的拳头）、"布"（平手）和 "剪刀"（伸出食指和中指的拳头，形成一个 V 形）。

这是一场同时进行的零和游戏，有三种可能的结果：平局、胜利或失败。决定选择石头的玩家会打败另一个选择剪刀的玩家 (“石头压碎剪刀”或“打破剪刀”或有时“使剪刀变钝”)，但会输给选择玩布的玩家 (“布盖住石头”);玩布会输给玩剪刀 (“剪刀剪布”)。如果两个玩家选择相同的形状，游戏是平局，通常会立即重玩打破平局。该游戏从中国传播开来，并随着时间的推移开发了不同的变体。

一种流行的五种武器的扩展是 "剪刀、石头、布 斯波克、蜥蜴"，由 Sam Kass 和 Karen Bryla 发明，在标准的三种选择中增加了 "斯波克 "和 "蜥蜴"。"斯波克"的标志是《星际迷航》中的瓦肯礼节，而 "蜥蜴"的标志是将手形成一个类似袜子木偶的嘴。斯波克砸碎了剪刀，蒸发了岩石；他被蜥蜴毒死了，被布证明了。蜥蜴毒死了斯波克，吃了布；它被石头压碎，被剪刀斩断。这个变体在 2005 年《伦敦时报》的一篇文章中被提及，后来成为 2008 年美国情景喜剧《生活大爆炸》一集的主题（作为岩石 - 剪刀 - 蜥蜴 - 斯波克）。

任何人都可以轻松地创建自己的去中心化的游戏应用，并在 Gear 网络上运行。为此，我们做了一个 "石头、剪刀、布、斯波克、蜥蜴 "的游戏版本，供多个玩家使用，在几轮紧张的斗争中，可以决定胜负。源代码可在 [GitHub]（https://github.com/gear-dapps/rock-paper-scissors）上找到。这篇文章介绍了程序接口、数据结构、基本功能，并解释了它们的用途。你可以直接使用，也可以根据场景进行修改。另："石头、剪刀、布、斯波克、蜥蜴" 在下文中简称为 "新版猜拳游戏"。

## 逻辑

### 配置

首先，有人（管理员）应该部署一个 "新版猜拳游戏"程序，并设置游戏参数。

```rust
pub struct GameConfig {
    pub bet_size: u128,
    pub players_count_limit: u8,
    pub entry_timeout: u64, // in ms
    pub move_timeout: u64, // in ms
    pub reveal_timeout: u64, // in ms
}
```

### 改变下一个游戏配置

所有游戏阶段的管理员可以通过使用 `ChangeNextGameConfig(GameConfig)` 改变下一个游戏配置。

当游戏结束时，这个配置将被启用。

### 停止游戏

所有游戏阶段的管理员都可以通过使用 `StopGame` 停止游戏。

例如，这个动作可以用来改变游戏的配置，或者如果玩家已经退赛，不想继续游戏，或者游戏已经持续了很长时间。

当管理员停止游戏时，所有资金将在游戏中剩余的玩家中分配。如果游戏处于注册阶段，投注将被退回到整个大厅。

### 注册

玩家可以通过发送`Register` 动作支付赌注（赌注大小）来注册游戏。

注册阶段从程序部署 (或前一场游戏结束) 开始持续 `entry_timeout` 毫秒。之后游戏开始，玩家可以采取行动。

>如果注册阶段已经结束，但是只有 1 或 0 个玩家注册，注册阶段将通过`entry_timeout`延长。玩家将不会被取消注册。

### 出拳

在出拳阶段，玩家必须从五个出拳选项中选择一个（石头剪刀布蜥蜴斯波克）。

为了提交玩家的选择，提供此功能的服务必须允许玩家输入密码或自己生成密码并保存在本地存储中。需要用密码来保护用户的出拳不被其他玩家发现，因为其他玩家很想在区块链中看到其他玩家的出拳结结果。在密码生成或输入后，服务应该将棋子的数量（石头-'0'，布-'1'，剪刀-'2'，蜥蜴-'3'，Spock-'4'）与密码连接起来，得到一个类似 "2pass"的字符串。然后服务用 256 位 blake2b 对其进行 hash，变成一个十六进制字符串，并通过`MakeMove(String)`将这个 hash 发送到区块链。

>玩家不能改变他的出拳

在所有玩家完成之前，或者在注册结束或这一轮开始后的`move_timeout`毫秒内，出拳阶段继续进行。之后，揭秘阶段就开始了，玩家可以展示出拳结结果，这样程序就可以判定谁是赢家。

>如果出拳阶段的时间已经结束，但是没有人进行出拳，出拳阶段将通过`move_timeout`延长。玩家可以进一步采取行动。
>
>如果出拳阶段的时间已经结束，但只有一个玩家进行了出拳，这个玩家被宣布为赢家并获得全部奖励。

### 揭示

揭示是防止游戏作弊的必要步骤。在这个阶段，玩家必须确认他们的出拳。为此，他们必须重复密码（或服务可以从他的存储中获得），重复出拳（或服务可以从他的存储中获得），服务应该只是将出拳结果（石头-'0'，布-'1'，剪刀-'2'，蜥蜴-'3'，斯波克-'4'）与密码连接起来，得到一个类似 "2pass"的字符串，并通过`Reveal(String)`动作将其发送到区块链上。在这一步中，程序验证在出拳阶段提交的哈希值等于一个开放字符串的哈希值，并保存这个出拳（字符串的第一个字符），以确定一个赢家。

在所有玩家完成后或时间结束后，程序会确定获胜的出拳结果，以找出继续争夺奖励的玩家。而选择了获胜招数的玩家则进入下一轮。

> 有些情况下，程序无法确定赢家的行动。例如，有一个石头，一个布和一招剪刀，在这种情况下，石头会压碎剪刀，剪刀会剪断布，而布会盖住石头，那么我们将无法确定获胜的棋步，因为所有的棋步都被击败了。在这种情况下，所有玩家都会进入下一轮。

在程序确定了进入下一轮的玩家后，出拳阶段再次开始，玩家可以出拳。如果只有一个这样的玩家，游戏就会结束，所有的奖励都归于该玩家。

当游戏结束时，新游戏将以`ChangeNextGameConfig(GameConfig)`设置的新配置立即开始。如果没有，继续按照旧配置进行

>如果揭示阶段的时间已经结束，但没有人采取继续猜拳，猜拳阶段将通过`reveal_timeout`延长。玩家可以继续猜拳。
>
>如果展示阶段结束，但只有一个玩家展示了一个招式，这个玩家就被宣布为赢家并获得全部奖励。新的游戏马上开始。

## 接口

### 动作

```rust
pub enum Action {
    Register,
    MakeMove(String),
    Reveal(String),
    ChangeNextGameConfig(GameConfig),
    StopGame,
}
```

- `Register` 是玩家在游戏大厅注册的一个动作
- `MakeMove`  是一个发送玩家的行动与密码串联的 blake2b 哈希值的动作
- `Reveal`  是一个向程序揭示玩家猜拳结果的行动
- `ChangeNextGameConfig` 是一个允许所有者更改下一个游戏配置的操作，该配置将在当前游戏后立即开始。
- `StopGame` 是一个允许拥有者结束当前游戏并给予当前玩家部分奖励的行动

### 事件

```rust
pub enum Event {
    PlayerRegistred,
    SuccessfulMove(ActorId),
    SuccessfulReveal(RevealResult),
    GameConfigChanged,
    GameWasStopped(BTreeSet<ActorId>),
}

pub enum RevealResult {
    Continue,
    NextRoundStarted { players: BTreeSet<ActorId> },
    GameOver { winner: ActorId },
}
```

- `PlayerRegistred` 是当某人成功使用 `Register` 动作时发生的事件
- `SuccessfulMove(ActorId)` 当有人成功使用`MakeMove`动作时发生的事件，它返回一个做出此动作的玩家的 ActorId
- `SuccessfulReveal` 是一个事件，当有人成功使用`Reveal`动作时发生的事件，它返回揭示的结果和实际游戏阶段。
- `GameConfigChanged`当有人成功使用 `ChangeNextGameConfig` 动作时发生的事件。
- `GameWasStopped` 当钱包成功使用`StopGame`动作时发生的事件，它返回获得奖励或赌注的玩家的 ID。

### 状态

*请求：*

```rust
pub enum State {
    Config,
    LobbyList,
    GameState,
    CurrentStageTimestamp,
}

pub enum GameStage {
    Preparation,
    InProgress(StageDescription),
    Reveal(StageDescription),
}

pub struct StageDescription {
    pub anticipated_players: BTreeSet<ActorId>,
    pub finished_players: BTreeSet<ActorId>,
}
```

- `Config` 返回当前游戏的 `GameConfig`
- `LobbyList` 返回在此游戏中注册的所有玩家的列表，无论他们目前是否退出游戏
- `GameStage` 返回当前的`GameStage`和相应的 `StageDescription`，如果需要的话，程序用户可以获得关于这个阶段的预期玩家（`anticipated_players`）或已经完成的玩家（`finished_players`）的信息。

- `CurrentStageTimestamp` 返回当前阶段启动的时间戳

每个状态请求都有一个同名的对应回复。

*消息：*

```rust
pub enum StateReply {
    Config(GameConfig),
    LobbyList(Vec<ActorId>),
    GameStage(GameStage),
    CurrentStageTimestamp(u64),
}
```

## 源码

"新版猜拳游戏" 的源码在 [GitHub](https://github.com/gear-dapps/rock-paper-scissors)上。

更多关于在 Gear 上测试智能合约的细节，请参考这篇文章：[应用测试](https://wiki.gear-tech.io/zh-cn/developing-contracts/testing/)。
