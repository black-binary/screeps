##简介

一个Screeps的游戏AI, 由@black_binary开发

##模块

(Todo list)

### 多房间系统

	同时运作多个房间, 并统计关键数据
	
	存储位置 Memory.room[房间名]

	#### 房间数据格式
	房间名:
	{
		objects{}:矿/工地/建筑,
		owned: 是否占有(远程采集用),
		若owned为假:
		charged: 隶属的房间号(远程采集用)
		若owned为真:
		(用于孵化策略的反馈调节)
		producedEnergy:在过去1000ticks中(下同)采集的能量总值,
		consumedEnergy:消耗的能量总值,
		collectedEnergy:收集的能量总值,
		storedEnergy:存储的能量总值,
	}
	
### 任务调度系统

	脚本根据房间的信息生成任务, 每个creep接受一个任务后一直执行直到完成. 有效提高运作效率, 避免creep半途而废的情况, 同时降低CPU占用

	基本工作可以自动生成, 也可以手动生成高级任务

	#### 任务种类

	1. 采集 Harvest
		- 采集之后返回(Remote mining)
			前期普通worker在远程采集时可以接受
		- 采集之后完成任务,接任务
			前期普通worker可以接受
		- 一直采集到死
			接了这个任务的creep要在死的时候之后由全局脚本孵化新的creep并继承其memory(或直接清除memory并完成任务)

		已经占领的房间的source会根据等级生成采集任务, 被命令指定的房间会生成远程采集任务


	2. 收集能量 Collect
		- Container
		- Storage
		- 地上

		只有能量为0的hauler可以接受(2级以后才出现)

	3. 放置能量
		- Extension/Spawn
		- Container
		- Storage
		- Link

		hauler/worker 而且有能量可以接受

	4. 维修
		- 建筑发生损坏(围墙除外)超过一定比例之后会生成维修任务, 修理的目标是完全满状态
		- 围墙修理到规定值

		有能量的worker可以接受

	5. 建造
		存在ConstructionSite时生成一个建造任务
		有能量的worker可以接受

	6. 升级
		有能量的worker和upgrader可以接受

	7. 防卫型攻击
		当占有的/远程房间中存在敌对目标时生成
		tower(建筑)和guard可以接受(就近原则攻击)
		拥有最高优先级

	8. 侵略型攻击
		...

	#### 任务存储结构

	所有任务存储在Memory.tasks中

	id(唯一标识):
	{
		type:任务类型,
		priority:任务优先级,
		subtype:子类型,
		target:操作目标ID,
		target1:(可选)操作目标ID,
		pos:(可选)要到达的位置(采集用),
		require:(可选)需要的creep数,大于0才可接受,接受后自减,
		progress: (可选)容器的剩余容量/建造进度,
		expire: (可选)过期tick,
	}

	#### 任务接受/完成逻辑
		
		接受任务时将任务复制到creep.memory.task, 副本中的require/progress过期
		任务的progress由全局脚本维护, 每tick更新一次
		任务的require由creep和全局脚本共同维护, memory对应的creep不存在(死了)/完成任务后更新其值
		

### 人口控制系统

	根据房间的资源/布局/生产消费比例控制人口数量

	#### 角色配置
		
		- Worker
			万能工人
			[WORK,CARRY,MOVE] * n ,1<=n<=3
			配置根据当前房间等级调整

		- Harvester
			进行container mining的采集者
			[WORK,WORK,WORK,WORK,WORK,MOVE,MOVE,MOVE]

		- Hauler
			进行能量运输的搬运工
			[CARRY,MOVE] * n

		- Upgrader
			后期专注升级
			[WORK,MOVE] * n + [CARRY]

		- Guard
			...

	#### 孵化队列

		每个spawn有一个孵化的优先队列(堆好像没有必要,元素太少), 按优先级复活
		存储在Memory.respawn.(spawn_name)
		
		结构如下:

		{
			priority:孵化优先级,
			memory:{...}孵化后creep的初始化memory,
			body:creep配置,
		}

	#### 孵化策略

		存储位置Memory.spawn[spawn名].queue

		- 采集
			等级<=2时, 采集者数=sources数*2
			等级>=3时, harvester数=sources数

		- 运输
			等级>=3时, 2个hauler
			若能量堆积, 配置+1
			若能量不足, 配置-1

			堆积/不足判定用 房间的collected/storedEnergy 衡量

		- 升级
			最低1个worker/upgrader
			若能量堆积, +1
			若能量不足, -1

		- 建造
			若能量盈余而且存在建造任务
			则每4个工地1个creep

		- 战斗
			每个房间固定1个guard
		
### 行动系统

	- 移动

		如果目标不在当前房间,房际移动
		否则向目标动
	
	- 房际移动

		找最近exit走

	- 采集

		先移动
		普通采集: 跑过去挖
		固定采集: 跑到指定位置(target)站着挖(target1)

	- 运输/升级/建造/战斗
		移动,干活	

### 用户指令

	- 远程采集

	- 标记Container

	- 标记Link

	- 声明Controller

	- 反转Controller

### 入侵防御机制
	
	当占有的房间中存在敌对目标时, 所有防御任务优先级提升到最高
	
	- 修理围墙

	- 制造guard

	- 为tower提供能量


### 扩张系统



............
